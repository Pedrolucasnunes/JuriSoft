import { NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/services/googleCalendar"

export async function GET() {
  return NextResponse.redirect(getGoogleAuthUrl())
}
