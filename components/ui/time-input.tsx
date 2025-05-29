'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

interface TimeInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimeInput({
  value,
  onChange,
  disabled,
  id,
  className,
  ...props
}: TimeInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Input
      id={id}
      type="time"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  )
} 