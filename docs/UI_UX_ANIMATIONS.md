# Articulink UI/UX Animation & Design System Reference

This document outlines the core animation patterns, design principles, and reusable UI components used across the Articulink mobile application. Use these as a reference to ensure visual and interactive consistency when building new screens.

## 🎨 Brand Palette
All screens follow a consistent color system based on the Articulink brand identity.

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Cream** | `#FAF8F4` | Default light background color. |
| **Royal Blue** | `#1A4480` | Primary brand color, headers, primary buttons. |
| **Teal** | `#2A8FA0` | Accent color, highlights, active states. |
| **Text Dark** | `#1C2B3A` | Primary headings and body text. |
| **Text Mid** | `#4A5A6A` | Secondary text, descriptions, captions. |
| **Sand Mid** | `#DDD6C8` | Borders, separators, and subtle backgrounds. |

---

## ✨ Core Animation Patterns

### 1. Simple Entry Transition (Fade + Slide)
Used for the initial appearance of content on a screen (e.g., `BrandIntroScreen`, `AboutScreen`).

**Pattern:**
- **Fade:** `opacity` from `0` to `1`.
- **Slide:** `translateY` from `30` (or `50`) down to `0`.
- **Timing:** `timing` for fade (approx. 700-800ms) and `spring` for the slide to give it a "natural" feel.

```tsx
const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(30)).current;

useEffect(() => {
    Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
    ]).start();
}, []);
```

### 2. Parallax Header Effect
Used on informational screens like `About` and `Security` to create depth during scrolling.

**Interpolation Logic:**
- **Translation:** The header image moves at a slower rate than the scroll (e.g., `0` to `-60` while scrolling `250`).
- **Scaling:** The header scales down slightly (e.g., `1` to `0.92`) as it moves away.
- **Opacity:** The content of the header fades out as it nears the top.

```tsx
const headerTranslateY = scrollX.interpolate({
    inputRange: [0, 250],
    outputRange: [0, -60],
    extrapolate: 'clamp',
});

const headerScale = scrollX.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
});
```

### 3. Progressive Reveal (Typewriter Transition)
Used in the `LoginScreen` for a premium welcoming experience.

**Pattern:**
1. Type out a message character by character using `setInterval`.
2. Once complete, fade out the text.
3. Simultaneously fade in and scale up the brand logo.

### 4. Layout Animations (Accordions)
Used for expanding sections in the `About` and `Security` screens.

**Pattern:**
- Use `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` before toggling state.
- Use `Animated.timing` for the chevron rotation.

```tsx
const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, { toValue: expanded ? 0 : 1, duration: 200, useNativeDriver: true }).start();
    setExpanded(!expanded);
};
```

### 5. Horizontal Paging (Onboarding Style)
Used in the `StartUpScreen` for smooth onboarding slides.

**Pattern:**
- Link `FlatList` scroll events to an `Animated.Value` (`scrollX`).
- Use `scrollX` to interpolate card properties (opacity, scale, translation) based on the slide index.
- **Active Dot Interaction:** Pagination dots expand in width (e.g., `6` to `22`) as they become active.

---

## 🛠️ Reusable UI Components

### 1. Rounded Containers (Cards)
All major content blocks use a high border-radius and subtle elevation.
- **Radius:** `28` or `35` for large sections, `12-16` for internal cards.
- **Shadow:** Low opacity (`0.06` to `0.1`), soft blur (`elevation: 8`).

### 2. Interaction Feedback
Never leave a button or clickable element static.
- **Press Style:** `{ scale: 0.98, opacity: 0.9 }`. This provides immediate tactile feedback.

### 3. Decorative SVG Transitions
Use wave paths between contrasting background sections (e.g., the transition from white content to the Royal Blue footer in `StartUpScreen`).

```tsx
<Path
    fill={COLORS.royalBlue}
    d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
/>
```

### 4. Z-Stack Layering
Use `ZStack` or absolute positioning to layer "Floating Orbs" (Circles with low opacity and tints) in the background to add visual interest without clutter.

---

## 📝 General UX Best Practices
- **StatusBar Handling:** Use `translucent` and `backgroundColor="transparent"` with `barStyle="dark-content"` or `"light-content"` depending on the header color.
- **Loading States:** Use the `Spinner` component with brand colors (e.g., `white` on blue buttons) to maintain context during async actions.
- **Accessibility:** Use `SizableText` with appropriate `ls` (letterSpacing) and `lh` (lineHeight) for better readability.
