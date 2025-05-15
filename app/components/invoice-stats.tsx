"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function InvoiceStats() {
  const data = [
    {
      name: "Jan",
      total: 18000,
    },
    {
      name: "Feb",
      total: 22000,
    },
    {
      name: "Mar",
      total: 25000,
    },
    {
      name: "Apr",
      total: 32000,
    },
    {
      name: "May",
      total: 45000,
    },
    {
      name: "Jun",
      total: 38000,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Bar dataKey="total" fill="#d97706" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
