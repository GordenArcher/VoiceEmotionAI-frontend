# Voice Emotion Recognition App - Frontend

A beautiful, modern React Native mobile application for voice emotion recognition using machine learning.

## 📱 Project Overview

This React Native app allows users to record their voice and analyze emotional patterns using AI. The app provides a seamless experience for recording, analyzing, and tracking emotional states over time.

## Project Structure

```
app/
├── (tabs)/                    # Main tab navigation
│   ├── index.tsx             # Home screen - Voice recording & analysis
│   ├── history.tsx           # Recordings history & statistics
│   └── profile.tsx           # User profile & settings
├── _layout.tsx               # Root layout configuration
├── login.tsx                 # Authentication screen
└── +not-found.tsx            # 404 error page

components/
├── ui/                       # Reusable UI components
│   ├── icon-symbol.tsx       # Icon wrapper component
│   └── haptic-tab.tsx        # Haptic feedback tab component
├── RecordingDetailModal.tsx  # Recording detail bottom sheet
└── (add more as needed)

contexts/
└── AuthContext.tsx           # Authentication state management

constants/
└── theme.ts                  # Color themes and design tokens

hooks/
├── use-color-scheme.ts       # Dark/light mode hook
└── use-theme-color.ts        # Theme color hook

services/
└── api.ts                    # API service layer

assets/
├── images/                   # Static images
└── fonts/                    # Custom fonts
```

## Design System

### Color Themes
- **Light Mode**: Clean, modern interface with light backgrounds
- **Dark Mode**: Comfortable dark theme with proper contrast
- **Dynamic Colors**: Automatically adapts to system theme

### Key Colors
- `tint`: Primary brand color for buttons and active states
- `background`: Main background color
- `text`: Primary text color
- `card`: Card and surface background
- `border`: Border and separator colors
- `tabIconDefault`: Inactive tab icon color

### Typography
- Clean, readable font hierarchy
- Proper weight distribution (400, 500, 600, 700, 800)
- Consistent spacing and line heights

## Core Features

### 1. Voice Recording & Analysis
- **High-quality Recording**: Professional audio capture
- **Real-time Timer**: Recording duration display
- **Playback Preview**: Listen before analyzing
- **Emotion Detection**: AI-powered emotion analysis
- **Confidence Scores**: Probability distribution across emotions

### 2. Emotion Tracking
- **Historical Data**: View past recordings and analyses
- **Statistics Dashboard**: Recordings count and emotion trends
- **Visual Charts**: Emotion probability breakdown
- **Trend Analysis**: Most frequent emotions over time

### 3. User Management
- **Profile Management**: Update personal information
- **Preferences**: Notification and theme settings
- **Account Security**: Logout and account deletion
- **Data Persistence**: Secure local storage

## 🛠️ Technical Implementation

### State Management
```typescript
// Authentication Context
interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Recording State
interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  isAnalyzing: boolean;
  recordingUri: string | null;
  result: AnalysisResponse | null;
}
```

### API Integration
```typescript
class ApiService {
  // Authentication
  login(email: string, password: string)
  logout()
  getProfile()
  updateProfile(data)
  deleteAccount()

  // Recordings
  uploadAndAnalyze(audioUri: string)
  getRecordings()
  getRecording(id: number)
  deleteRecording(id: number)
  reanalyzeRecording(id: number)
  
  // Statistics
  getStatistics()
}
```

### Navigation Structure
```
Root Stack
├── (tabs) - Bottom Tab Navigator
│   ├── Home (index) - Record & Analyze
│   ├── History - View Past Recordings
│   └── Profile - User Settings
├── Login - Authentication
└── +not-found - Error Handling
```

## Key Components

### HomeScreen (`app/(tabs)/index.tsx`)
- Voice recording interface with animated buttons
- Real-time recording timer
- Audio playback controls
- Emotion analysis results with beautiful bottom sheet
- Smooth animations and transitions

### HistoryScreen (`app/(tabs)/history.tsx`)
- Recordings list with emotion badges
- Statistics cards (total recordings, analyses, top emotion)
- Pull-to-refresh functionality
- Recording detail modal with full analysis

### ProfileScreen (`app/(tabs)/profile.tsx`)
- User profile with avatar and stats
- Editable profile information
- Preference toggles (notifications, dark mode)
- Account management actions
- Pull-to-refresh support

### RecordingDetailModal (`components/RecordingDetailModal.tsx`)
- Bottom sheet presentation
- Emotion probability charts
- Action buttons (delete, reanalyze)
- Smooth animations and gestures

## Data Flow

1. **Recording Process**:
   ```
   Start Recording → Stop Recording → Preview Audio → Analyze → Display Results
   ```

2. **Authentication Flow**:
   ```
   Login → Store Token → Fetch Profile → Protected Routes
   ```

3. **Data Synchronization**:
   ```
   Local State → API Calls → State Update → UI Refresh
   ```

## UI/UX Features

### Visual Design
- **Glassmorphism**: Beautiful blurred tab bar
- **Smooth Animations**: Spring-based transitions
- **Haptic Feedback**: Tactile responses for interactions
- **Loading States**: Elegant loading indicators
- **Empty States**: Helpful empty state illustrations

### Interaction Design
- **Pull-to-Refresh**: Refresh data with intuitive gesture
- **Swipe Gestures**: Natural navigation patterns
- **Bottom Sheets**: Contextual information presentation
- **Progressive Disclosure**: Information revealed as needed

## Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- React Native development environment
- iOS Simulator or Android Emulator

### Installation
```bash
# Clone the repository
git clone https://github.com/GordenArcher/VoiceEmotionAI.git

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Platform Support

### iOS
- Voice recording permissions
- Audio playback
- Push notifications
- Dark mode support
- Haptic feedback

### Android
- Voice recording permissions  
- Audio playback
- Push notifications
- Dark mode support
- Haptic feedback

## Performance Optimizations

- **Efficient Re-renders**: Optimized component updates
- **Image Caching**: Fast asset loading
- **API Caching**: Reduced network requests
- **Memory Management**: Proper cleanup of audio resources
- **Bundle Optimization**: Code splitting and tree shaking

## Security Features

- **Token-based Authentication**: Secure API communication
- **Secure Storage**: Encrypted local storage
- **Input Validation**: Client-side form validation
- **Error Handling**: Graceful error recovery
- **Privacy First**: Minimal data collection

## Analytics & Monitoring

- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: App performance metrics
- **User Analytics**: Usage patterns and feature adoption
- **Crash Reporting**: Real-time crash analytics

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- Utility functions

### Integration Tests
- API service layer
- Navigation flows
- User interactions

### E2E Tests
- Critical user journeys
- Cross-platform compatibility
- Performance benchmarks

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### App Store Deployment
- iOS: TestFlight → App Store
- Android: Internal testing → Play Store

## API Documentation

### Authentication Endpoints
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout  
- `GET /auth/profile/` - Get user profile
- `PUT /auth/profile/update/` - Update profile
- `DELETE /auth/delete-account/` - Delete account

### Recording Endpoints
- `POST /recordings/upload/` - Upload and analyze audio
- `GET /recordings/` - Get user recordings
- `GET /recordings/:id/` - Get specific recording
- `DELETE /recordings/:id/delete/` - Delete recording
- `POST /recordings/:id/reanalyze/` - Reanalyze recording

### Statistics Endpoints
- `GET /statistics/` - Get user statistics

## Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Comprehensive code documentation

### Component Patterns
- Presentational vs Container components
- Custom hooks for reusable logic
- Compound components for complex UIs
- Higher-Order Components for cross-cutting concerns

### State Management
- React Context for global state
- Local state for component-specific data
- Optimistic updates for better UX
- Proper error state handling

## Future Enhancements

### Planned Features
- [ ] Emotion trends and insights
- [ ] Social sharing of results
- [ ] Advanced audio filters
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Voice journaling
- [ ] Emotional wellness tips

### Technical Improvements
- [ ] Advanced caching strategies
- [ ] Background audio processing
- [ ] Real-time emotion detection
- [ ] Advanced animations
- [ ] Voice command integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Built with ❤️ using React Native, TypeScript, and Expo**