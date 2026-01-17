"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, Bot, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Streamdown } from "streamdown";

import { Button } from "@/components/ui/button";

const transport = new DefaultChatTransport({ api: "/api/chat" });

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
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
        {/* Initial greeting message */}
        <div className="flex items-start justify-start gap-3">
          <div className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <Bot className="text-primary-foreground size-4" />
          </div>
          <div className="max-w-[80%] rounded-lg">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              Olá! Sou o <span className="font-semibold italic">Agenda.ai</span>
              , seu assistente pessoal.
              {"\n\n"}
              Estou aqui para te auxiliar a agendar seu corte ou barba,
              encontrar as barbearias disponíveis perto de você e responder às
              suas dúvidas.
            </p>
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
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
                  : "bg-transparent"
              }`}
            >
              {msg.parts.map((part, i) => {
                if (part.type === "text") {
                  return msg.role === "assistant" ? (
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
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-secondary flex items-center gap-3 px-5 py-4"
      >
        <div className="bg-background border-border flex flex-1 items-center rounded-full border px-4 py-3">
          <input
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            type="text"
            placeholder="Digite sua mensagem"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="size-12 shrink-0 rounded-full"
          disabled={isLoading || !input.trim()}
        >
          <Send className="size-5" />
        </Button>
      </form>
    </main>
  );
}
