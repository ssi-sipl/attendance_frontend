import "./globals.css";

export const metadata = {
  title: "AttendEase",
  description: "Smart Attendance Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
