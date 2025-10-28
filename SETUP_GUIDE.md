# 🚀 Setup Guide: Auto Release & NPM Publishing

## 📋 Prerequisites

1. **NPM Account**: Đảm bảo bạn đã có tài khoản npm và đã verify email
2. **GitHub Repository**: Repository đã được push lên GitHub
3. **Git Access**: Quyền push lên repository

## 🔑 Setup NPM Token

### Bước 1: Tạo NPM Access Token

```bash
# Đăng nhập npm (nếu chưa)
npm login

# Tạo access token
npm token create --read-only=false
```

**Hoặc** tạo qua web interface:

1. Đi tới [npmjs.com](https://www.npmjs.com) → Account → Access Tokens
2. Click "Generate New Token" → "Automation"
3. Copy token được tạo

### Bước 2: Thêm Token vào GitHub Secrets

1. Đi tới GitHub repository: https://github.com/doanphungtu/tudp-rn-debugger
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste token từ bước 1
6. Click **"Add secret"**

## 🎯 How to Use

### Option 1: Sử dụng Script Tự động (Recommended)

```bash
# Chạy script release
./scripts/release.sh

# Script sẽ:
# 1. Kiểm tra git status
# 2. Hỏi loại version (patch/minor/major/custom)
# 3. Update package.json
# 4. Build project
# 5. Update CHANGELOG.md
# 6. Commit & push
# 7. Tạo tag → trigger GitHub Actions
```

### Option 2: Manual Release

```bash
# 1. Bump version
npm version patch  # hoặc minor, major

# 2. Build
yarn build

# 3. Commit changes
git add .
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"

# 4. Create tag
git tag "v$(node -p "require('./package.json').version")"

# 5. Push
git push origin main
git push origin --tags
```

## 🔄 Auto Release Process

Khi bạn push tag `v*` (ví dụ: `v1.0.6`), GitHub Actions sẽ tự động:

1. ✅ **Checkout code**
2. ✅ **Setup Node.js & Yarn**
3. ✅ **Install dependencies**
4. ✅ **Build project** (`yarn build`)
5. ✅ **Run tests** (`yarn test`)
6. ✅ **Create GitHub Release** với changelog
7. ✅ **Publish to NPM** (`npm publish --access public`)
8. ✅ **Send notifications**

## 📦 Package Info

- **Name**: `@tudp/rn-debugger`
- **Registry**: https://www.npmjs.com/package/@tudp/rn-debugger
- **Access**: Public (anyone can install)

## 🎉 Usage After Published

```bash
# Install
npm install @tudp/rn-debugger
# or
yarn add @tudp/rn-debugger
```

```typescript
// Import
import NetworkDebugger, {
  startNetworkLogging,
  stopNetworkLogging,
} from "@tudp/rn-debugger";

// Use
function App() {
  useEffect(() => {
    startNetworkLogging();
    return () => stopNetworkLogging();
  }, []);

  return <NetworkDebugger visible={true} />;
}
```

## 🔍 Monitoring

- **GitHub Actions**: https://github.com/doanphungtu/tudp-rn-debugger/actions
- **NPM Package**: https://www.npmjs.com/package/@tudp/rn-debugger
- **Releases**: https://github.com/doanphungtu/tudp-rn-debugger/releases

## ⚠️ Troubleshooting

### 1. NPM_TOKEN Invalid

```
Error: 401 Unauthorized
```

**Solution**: Recreate npm token và update GitHub secret

### 2. Build Failed

```
Error: Build failed
```

**Solution**: Check TypeScript errors, fix và re-run

### 3. Git Not Clean

```
Working directory is not clean
```

**Solution**: Commit hoặc stash changes trước khi release

### 4. Wrong Branch

```
You must be on main branch
```

**Solution**: `git checkout main` trước khi release

## 🎯 Best Practices

1. **Always test locally** trước khi release
2. **Update CHANGELOG.md** với meaningful changes
3. **Use semantic versioning**:
   - `patch`: Bug fixes (1.0.0 → 1.0.1)
   - `minor`: New features (1.0.0 → 1.1.0)
   - `major`: Breaking changes (1.0.0 → 2.0.0)
4. **Monitor GitHub Actions** sau mỗi release
5. **Verify npm package** sau khi publish

---

✨ **All set!** Bây giờ bạn có thể tạo release tự động chỉ bằng một command! 🚀
