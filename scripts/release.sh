#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting release process for @tudp/rn-debugger..."

# Check if working directory is clean
if [[ $(git status --porcelain) ]]; then
  echo "❌ Working directory is not clean. Please commit your changes first."
  echo "📋 Uncommitted changes:"
  git status --short
  exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "❌ You must be on main branch to create a release. Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Ask for version type
echo ""
echo "📝 What type of release do you want to create?"
echo "1) patch (${CURRENT_VERSION} -> $(node -p "require('semver').inc('${CURRENT_VERSION}', 'patch')"))"
echo "2) minor (${CURRENT_VERSION} -> $(node -p "require('semver').inc('${CURRENT_VERSION}', 'minor')"))"
echo "3) major (${CURRENT_VERSION} -> $(node -p "require('semver').inc('${CURRENT_VERSION}', 'major')"))"
echo "4) custom version"
echo ""

read -p "Enter choice (1-4): " choice

case $choice in
  1)
    VERSION_TYPE="patch"
    ;;
  2)
    VERSION_TYPE="minor"
    ;;
  3)
    VERSION_TYPE="major"
    ;;
  4)
    read -p "Enter version (e.g., 1.2.3): " CUSTOM_VERSION
    if [[ ! $CUSTOM_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "❌ Invalid version format. Please use semantic versioning (e.g., 1.2.3)"
      exit 1
    fi
    VERSION_TYPE=$CUSTOM_VERSION
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

# Update version
echo "🔧 Updating version..."
if [[ $choice == 4 ]]; then
  npm version $VERSION_TYPE --no-git-tag-version
else
  npm version $VERSION_TYPE --no-git-tag-version
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Updated version to: $NEW_VERSION"

# Build the project
echo "🔨 Building project..."
yarn build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Rolling back version change..."
  git checkout -- package.json
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
yarn test

if [ $? -ne 0 ]; then
  echo "⚠️  Tests failed, but continuing with release..."
fi

# Update changelog (create if doesn't exist)
echo "📄 Updating CHANGELOG.md..."
if [ ! -f CHANGELOG.md ]; then
  echo "# Changelog

All notable changes to this project will be documented in this file.

## [$NEW_VERSION] - $(date +%Y-%m-%d)

### Added
- Initial release of @tudp/rn-debugger
- Network request debugging for React Native
- Clean Architecture implementation

### Features
- Real-time network request monitoring
- Request/Response details view
- Copy as cURL functionality
- Clean and intuitive UI

" > CHANGELOG.md
else
  # Prepend new version to existing changelog
  echo "## [$NEW_VERSION] - $(date +%Y-%m-%d)

### Added
- Bug fixes and improvements

$(cat CHANGELOG.md)" > CHANGELOG.md.tmp
  mv CHANGELOG.md.tmp CHANGELOG.md
fi

# Commit changes
echo "📝 Committing changes..."
git add .
git commit -m "chore: bump version to $NEW_VERSION

- Updated package.json version
- Updated CHANGELOG.md
- Build artifacts updated"

# Create and push tag
echo "🏷️  Creating tag v$NEW_VERSION..."
git tag "v$NEW_VERSION"

echo "🚀 Pushing changes and tag to remote..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "🎉 Release $NEW_VERSION created successfully!"
echo "📦 GitHub Actions will automatically:"
echo "   - Create a GitHub release"
echo "   - Publish to npm registry"
echo "   - Send notifications"
echo ""
echo "🔗 Monitor the progress at: https://github.com/doanphungtu/tudp-rn-debugger/actions"
echo "📦 Package will be available at: https://www.npmjs.com/package/@tudp/rn-debugger"
echo ""
echo "✨ All done! 🎊"