# Articulink Mobile Client - Version Control & Project Structure

This document provides an overview of the mobile client application's version control and its architectural structure.

## 1. Version Control Information

The application uses Semantic Versioning (SemVer) and manages its version info in two primary locations. Any version updates should be synchronized across both files.

### Primary Versioning Files
1. **`package.json`**:
   - Path: `client/package.json`
   - Key: `"version"`
   - Value: `1.0.0`
2. **`app.json`**:
   - Path: `client/app.json`
   - Key: `"expo.version"`
   - Value: `1.0.0`

### Repository and Branching
- The project is a **Git** repository.
- Use `git branch` to see available feature branches (common: `zoro`, `avery`).

---

## 2. Project Folder Structure

The application source code is primarily located in the `src/` directory.

### Root Directory (Client)
- **`.expo/`**: Expo-related cache and configuration.
- **`assets/`**: Images, icons, and font files.
- **`src/`**: Core application logic.
- **`App.tsx`**: Entry point of the React Native / Expo application.
- **`app.json`**: Expo configuration.
- **`package.json`**: Node.js dependencies and scripts.
- **`tamagui.config.ts`**: Tamagui UI framework configuration.

### Source Directory (`client/src/`)
| Folder | Description |
| :--- | :--- |
| **`components/`** | Reusable UI components (e.g., `Loader.tsx`). |
| **`context/`** | React Context providers for state management (e.g., `AuthContext.tsx`). |
| **`navigation/`** | Navigation configuration using React Navigation. |
| **`screens/`** | Screen-level components. |
| **`styles/`** | Global or theme-related stylesheets. |
| **`utils/`** | Utility functions, API constants, and helper logic. |

### Navigation Breakdown (`src/navigation/`)
- **`AppNavigator.tsx`**: Root navigator orchestrating Auth and Tab-based flows.
- **`AuthNavigator.tsx`**: Navigation flow for non-authenticated users (Login, Register).
- **`TabNavigator.tsx`**: Main authenticated UI using a bottom tab bar.

### Screen Structure (`src/screens/`)
- **Main Flows**: `BrandIntroScreen`, `HomeScreen`, `LoginScreen`, `RegisterScreen`, `StartUpScreen`.
- **`tabs/`**: Screens accessible via the bottom tab bar:
  - `HistoryScreen`, `MapScreen`, `ProfileScreen`, `SettingsScreen`.
- **`Extras/`**: Specialized or nested screens:
  - `AboutScreen`, `ChatbotScreen`, `EditProfileScreen`, `SecurityPrivacyScreen`.

---

## 3. Technology Stack
- **Framework**: [Expo](https://expo.dev/) (SDK 54.0.6)
- **UI Framework**: [Tamagui](https://tamagui.dev/)
- **State Management**: React Context (`AuthContext`)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Network**: [Axios](https://axios-http.com/)
