"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolOrDynamicToolUIPart,
  getToolOrDynamicToolName,
} from "ai";
import { ArrowLeft, Bot, CreditCard, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";

const transport = new DefaultChatTransport({
  api: "/api/chat",
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
});

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  // Extrai checkoutUrl de um tool-result de checkout, se existir na mensagem
  const getCheckoutUrl = (
    parts: (typeof messages)[number]["parts"],
  ): string | null => {
    for (const part of parts) {
      if (
        isToolOrDynamicToolUIPart(part) &&
        getToolOrDynamicToolName(part) === "createBookingCheckoutSession" &&
        part.state === "output-available" &&
        typeof part.output === "object" &&
        part.output !== null &&
        "checkoutUrl" in part.output
      ) {
        return (part.output as Record<string, unknown>).checkoutUrl as string;
      }
    }
    return null;
  };

  return (
    <main className="bg-background flex h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-6">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => router.back()}
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <h1 className="font-serif text-2xl font-bold italic">Agenda.ai</h1>
        <div className="size-9" />
      </header>

      <div className="border-border mx-5 mt-4 rounded-lg border px-4 py-3">
        <p className="text-muted-foreground text-sm">
          Seu assistente de agendamentos está online.
        </p>
      </div>

      <section className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Mensagem inicial */}
        <div className="flex items-start gap-3">
          <div className="bg-primary flex size-8 items-center justify-center rounded-full">
            <Bot className="text-primary-foreground size-4" />
          </div>
          <p className="max-w-[80%] text-sm leading-relaxed whitespace-pre-line">
            Olá! Sou o <strong>Agenda.ai</strong>, seu assistente pessoal.
            {"\n\n"}
            Posso te ajudar a encontrar barbearias, horários disponíveis e
            finalizar seu agendamento.
          </p>
        </div>

        {messages.map((msg) => {
          const checkoutUrl =
            msg.role === "assistant" ? getCheckoutUrl(msg.parts) : null;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary-foreground size-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : ""
                }`}
              >
                {msg.parts.map((part, i) =>
                  part.type === "text" ? (
                    msg.role === "assistant" ? (
                      <Streamdown
                        key={i}
                        isAnimating={status === "streaming"}
                        className="text-sm leading-relaxed"
                      >
                        {part.text}
                      </Streamdown>
                    ) : (
                      <p key={i} className="text-sm leading-relaxed">
                        {part.text}
                      </p>
                    )
                  ) : null,
                )}

                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    className="bg-primary text-primary-foreground mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                  >
                    <CreditCard className="size-4" />
                    Clique aqui para pagar
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-secondary flex items-center gap-3 px-5 py-4"
      >
        <div className="bg-background border-border flex flex-1 items-center rounded-full border px-4 py-3">
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="Digite sua mensagem"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          className="size-12 rounded-full"
          disabled={isLoading || !input.trim()}
        >
          <Send className="size-5" />
        </Button>
      </form>
    </main>
  );
}
