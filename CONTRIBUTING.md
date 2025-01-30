# 🤝 Contributing

We welcome contributions to improve `eslint-plugin-fsd-lint`!  
If you have an idea for a new rule or an improvement, feel free to submit a Pull Request.

## 🛠 Setting Up the Project
To start contributing, clone the repository and install dependencies:

```shell
git clone https://github.com/effozen/eslint-plugin-fsd-lint.git
cd eslint-plugin-fsd-lint
npm install
```

---

## 🔧 Running ESLint in Development
You can test the plugin locally by running:

```shell
npm run lint
```

To check for formatting issues:
```shell
npm run format
```

---

## 📌 How to Contribute
1. Fork this repository to your GitHub account.
2. Create a new branch for your feature or bug fix:
```shell
git checkout -b feature/new-rule
```
3. Implement your changes:
   - Follow the existing code structure.
   - Add unit tests for any new rules.
   - Update documentation if needed.
4. Commit your changes:
```shell
git commit -m "feat: add new ESLint rule fsd/no-xyz"
```
5. Push your branch to your forked repository:
```shell
git push origin feature/new-rule
```
6. Submit a Pull Request:
   - Go to the original repository: [eslint-plugin-fsd-lint](https://github.com/effozen/eslint-plugin-fsd-lint).
   - Click on "New Pull Request".
   - Provide a clear description of the changes.
   - Wait for review and feedback.

---

## 📝 Commit Message Guidelines
We follow the **Conventional Commits** style:

| Type     | Description                                |
|----------|--------------------------------------------|
| feat     | New feature or rule addition               |
| fix      | Bug fix                                    |
| docs     | Documentation changes                      |
| refactor | Code refactoring (no functionality changes)|
| test     | Adding or updating tests                   |
| chore    | Minor changes (e.g., CI/CD, build scripts) |

Example commits:

```shell
git commit -m "feat: add fsd/no-cross-slice-dependency rule"
git commit -m "docs: update README with new rule details"
git commit -m "fix: resolve import path issue in fsd/no-relative-imports"
```
---

## ✅ Contribution Checklist
Before submitting a PR, make sure you: <br/><br/>
✔ Test your changes using `npm run test`.<br/>
✔ Ensure ESLint passes using `npm run lint`.<br/>
✔ Format your code using `npm run format`.<br/>
✔ Update documentation if required.<br/>

> 💡 Tip: Well-documented PRs with tests are reviewed faster!