# Lead Info Filler — Chrome Extension

A Chrome extension built for cold calling workflows. Instead of manually typing or copy-pasting a lead info template every call, this extension lets you fill out a structured form and copy everything to your clipboard in one click.

## Why I Built This

Working in cold calling, I had to fill the same lead info template repeatedly for every prospect. This extension eliminates that friction — open it, fill it, copy it, paste it. Done.

## Features

- **3 property types** — House, Land, and Commercial, each with relevant fields
- **One-click copy** — formats everything into the exact template needed and copies to clipboard
- **Persistent storage** — form data saves automatically and survives closing the popup
- **Tab memory** — remembers which property type you were last on
- **Clear button** — clears only the current tab, other tabs stay intact
- **Auto-fills** today's date and caller name on every open

## Property Types

| House | Land | Commercial |
|-------|------|------------|
| Property type, Beds, Baths, Sqft, Occupancy | Land type, Sqft/Acreage, Utilities | Business type, Sqft, Occupancy, Utilities, Condition |

All types share: General info, Seller info, 4 Pillars (Motivation, Timeline, Price), Notes, and Zillow fields.

## Installation

1. Clone or download this repo
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the project folder
5. The extension icon will appear in your Chrome toolbar

## Tech

- Vanilla JavaScript
- Chrome Extensions API (Manifest V3)
- `chrome.storage.local` for persistence
