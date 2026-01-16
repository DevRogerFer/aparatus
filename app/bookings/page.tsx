import { headers } from "next/headers";

import { getUserBookings } from "@/data/booking";
import { auth } from "@/lib/auth";

import BookingsClientPage from "./bookings-client-page";

const BookingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return <BookingsClientPage confirmed={[]} finished={[]} />;
  }
  const { confirmed, finished } = await getUserBookings(session.user.id);
  return <BookingsClientPage confirmed={confirmed} finished={finished} />;
};

export default BookingsPage;
