# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Adding audio feedback to button presses.
- Improved UI for mobile.

## [1.2.0] - 2025-01-21
### Added
- Proxy server for better security of API keys and Digital Signature.

### Changed
- Removed unnecessary logging for improving efficiency in production.

## [1.1.0] - 2025-01-17
### Added
- Added favicon support.

### Changed
- Updated logic to filter out indoor Street View images.

### Fixed
- Fixed score calculation bug when "Next" button was pressed.
- Fixed the issue where the title text appeared too small on mobile devices.

## [1.0.0] - 2025-01-16
### Added
- Initial release with basic game functionality:
  - Start screen, loading screen, game container, and end screen.
  - Integration with Google Street View API.
  - Dynamic Street View generation from 10 Indian cities.
