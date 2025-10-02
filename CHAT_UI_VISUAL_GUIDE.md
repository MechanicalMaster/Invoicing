# AI Chat UI - Visual Design Guide

## 🎨 Quick Visual Reference

### Color Palette

```
┌─────────────────────────────────────────────┐
│  Orange Brand Colors                        │
├─────────────────────────────────────────────┤
│  Primary:   #EA7317  ████████               │
│  Hover:     #D97706  ████████               │
│  Active:    #B45309  ████████               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Neutral Colors (Light Mode)                │
├─────────────────────────────────────────────┤
│  Background:     #F7F7F8  ████████          │
│  Message BG:     #ECECF1  ████████          │
│  Text Primary:   #353740  ████████          │
│  Text Muted:     #6E6E80  ████████          │
│  Border:         #D1D5DB  ████████          │
│  Placeholder:    #9CA3AF  ████████          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Dark Mode Colors                           │
├─────────────────────────────────────────────┤
│  Background:     #212121  ████████          │
│  Message BG:     #2A2B32  ████████          │
│  Text Primary:   #ECECF1  ████████          │
│  Border:         #4E4F60  ████████          │
└─────────────────────────────────────────────┘
```

---

## 📐 Layout Structure

```
┌───────────────────────────────────────────────────┐
│  ☰  AI Assistant ▾                      ⊕  ✕    │  Header (56px)
├───────────────────────────────────────────────────┤
│                                                   │
│   🤖  How can I help you?                        │  AI Message
│        [Light gray bubble]                        │
│        11:30 AM                                   │
│        📋 👍 👎                                   │  Actions
│                                                   │
│                     What's my inventory?    🧑   │  User Message
│                     [Orange bubble]              │
│                     11:31 AM                     │
│                                                   │  Messages Area
│   🤖  Here's your inventory...                   │  (Scrollable)
│        [Light gray bubble]                        │
│        11:31 AM                                   │
│        📋 👍 👎                                   │
│                                                   │
│                            ─── Today ───          │  Date Separator
│                                                   │
├───────────────────────────────────────────────────┤
│  [+] Message AI Assistant...            [🎤]    │  Input Area
│  ╰─────────────────────────────────────────╯     │  (Pill shaped)
│      Press Enter to send                  0/2000 │
└───────────────────────────────────────────────────┘

                         [🔘]                        Floating Button
                     (Gradient Orange)               (Bottom Right)
```

---

## 💬 Message Bubble Styles

### User Message (Right)
```
                    ┌─────────────────────┐
                    │  Hello, I need      │  • Orange #EA7317
                    │  help with this     │  • White text
                    │  invoice            │  • 18px radius
                    └─────────────────────┘  • 70% max width
                         11:45 AM             • Right aligned
                                              • No avatar
```

### AI Message (Left)
```
┌───┐  ┌────────────────────────────┐
│ AI│  │ I'd be happy to help!      │  • Gray #F7F7F8
└───┘  │ What specific issue are    │  • Dark text #353740
       │ you experiencing?           │  • 18px radius
       └────────────────────────────┘  • 100% max width
       11:45 AM  📋 👍 👎              • Left aligned
       (32px avatar with actions)      • Orange avatar
```

---

## 🎯 Input Area Anatomy

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  [+]  Type your message here...          [🎤]    │  Empty State
│                                                    │  (Shows voice icon)
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                                                    │
│  [+]  How do I create an invoice?        [🔘]    │  With Text
│                                                    │  (Shows send button)
└────────────────────────────────────────────────────┘

Details:
• Container: 28px border radius (pill shape)
• Background: White with #D1D5DB border
• Focus: Orange #EA7317 border + shadow
• Icons: 20px size, #6E6E80 color
• Send button: 32px orange circle
• Padding: 10px 16px
```

---

## 🎨 Header Components

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ☰    AI Assistant ▾                  ⊕    ✕  │
│  │         │                           │     │  │
│  │         │                           │     │  │
│  Menu   Dropdown                   New   Close │
│  (32px)  (Model)                   Chat  (32px)│
│                                                 │
└─────────────────────────────────────────────────┘

Dropdown Menu:
┌────────────────────┐
│ ● GPT-4o Mini      │  ← Orange dot indicator
├────────────────────┤
│ Clear conversation │
└────────────────────┘
```

---

## 🔘 Floating Button States

### Default State
```
        ┌───────┐
        │   💬  │  Gradient Orange
        │       │  60px × 60px
        └───────┘  Soft pulsing ring
```

### Hover State
```
        ┌────────┐
        │   💬✨ │  Scales to 110%
        │        │  Darker gradient
        └────────┘  Sparkle appears
```

### With Unread Badge
```
        ┌───────┐ [3]
        │   💬  │  ← Red badge
        │       │     Animated bounce
        └───────┘
```

---

## 📱 Responsive Breakpoints

### Mobile (<768px)
```
┌─────────────────┐
│     FULLSCREEN  │
│                 │
│   🤖 Message    │
│                 │
│         User 🧑 │
│                 │
│                 │
│  [Input Area]   │
└─────────────────┘
85% message width
Smaller padding
14-15px font
```

### Desktop (>768px)
```
┌──────────────┬────────────┐
│              │ ┌────────┐ │
│              │ │Header  │ │
│   Main App   │ ├────────┤ │
│              │ │Messages│ │
│              │ │        │ │
│              │ ├────────┤ │
│              │ │Input   │ │
│              │ └────────┘ │
└──────────────┴────────────┘
440px side panel
70% message width
16px font
```

---

## ⚡ Animation Timing

```
Message Appear:    300ms fade + slide
Hover Transitions: 200ms ease
Button Click:      150ms scale
Panel Open:        300ms slide
Typing Dots:       600ms stagger
Floating Button:   2000ms pulse
```

---

## 🎯 Interactive States

### Button States
```
Default:  [Button]        Normal appearance
Hover:    [Button]        Brightness +10%, scale +5%
Active:   [Button]        Scale 95%
Disabled: [Button]        Opacity 50%
Focus:    [Button]        Orange ring
```

### Input States
```
Default:  ─────────        Gray border
Focus:    ═════════        Orange border + shadow
Error:    ╍╍╍╍╍╍╍╍╍        Red border
Disabled: ┄┄┄┄┄┄┄┄┄        Opacity 50%
```

---

## 📐 Spacing System

```
Component Spacing:
├─ Message vertical:     16px (mb-4)
├─ Avatar to message:    12px (gap-3)
├─ Action icon spacing:   8px (gap-2)
├─ Input padding:        10px × 16px
└─ Container padding:    16px × 24px

Border Radius:
├─ Messages:    18px
├─ Input:       28px (pill)
├─ Avatar:      50% (circle)
├─ Buttons:     full (circle)
└─ Panel:       12px (md:rounded-xl)
```

---

## 🎨 Typography Scale

```
Message Text:      15px → 16px (responsive)
Timestamps:        11px
Helper Text:       12px
Header Title:      15px
Action Icons:      16px
Button Text:       14px

Line Heights:
Message:    1.6 → 1.7
Timestamps: 1.2
Headers:    1.4
```

---

## 🌈 Dark Mode Comparison

```
Light Mode              Dark Mode
─────────────────      ─────────────────
Background:  #F7F7F8   Background:  #212121
Message:     #ECECF1   Message:     #2A2B32
Text:        #353740   Text:        #ECECF1
Border:      #D1D5DB   Border:      #4E4F60

Orange accent stays the same! #EA7317
```

---

## 📊 Component Hierarchy

```
ChatPanel
├── ChatHeader
│   ├── Menu Button
│   ├── Dropdown (Model selector)
│   ├── New Chat Button
│   └── Close Button
│
├── ChatMessages
│   ├── Load More Button (if hasMore)
│   ├── Error State (if error)
│   ├── Empty State (if no messages)
│   ├── Date Separator
│   ├── ChatMessageItem (AI)
│   │   ├── Avatar
│   │   ├── Message Bubble
│   │   ├── Timestamp
│   │   └── Action Icons
│   ├── ChatMessageItem (User)
│   │   ├── Message Bubble
│   │   └── Timestamp
│   └── ChatLoading (if loading)
│
└── ChatInput
    ├── Attachment Button (+)
    ├── Textarea Input
    ├── Voice Button (🎤) / Send Button (🔘)
    └── Helper Text
```

---

## 🎭 Icon Reference

```
Used Icons:
💬  MessageCircle    - Floating button
✨  Sparkles         - Floating button hover
☰   Menu             - Header menu
▾   ChevronDown      - Dropdown indicator
⊕   MessageSquarePlus- New chat
✕   X                - Close button
🤖  Bot              - AI avatar (or "AI" text)
📋  Copy             - Copy message
👍  ThumbsUp         - Like message
👎  ThumbsDown       - Dislike message
+   Plus             - Attach file
🎤  Mic              - Voice input
🔘  Send             - Send message
↻   RefreshCw        - Retry failed
⚠   AlertCircle      - Error indicator
```

---

## ✨ Key Design Principles

1. **Clean & Minimal**: No unnecessary borders or shadows
2. **Brand Focused**: Orange (#EA7317) as primary accent
3. **Readable**: Optimal line height and spacing
4. **Smooth**: 60fps animations throughout
5. **Accessible**: WCAG AA compliant colors
6. **Responsive**: Adapts beautifully to all screens
7. **Consistent**: Uses design system values
8. **Professional**: ChatGPT-inspired polish

---

**Quick Reference Complete!**
Use this guide to understand the visual design at a glance.
