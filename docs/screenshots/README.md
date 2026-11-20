# Screenshots

Captured by `e2e/capture.spec.ts` against a production build, with the WEB translation only:

```sh
npm run build
npx playwright test e2e/capture.spec.ts --project=desktop --grep @capture
```

The same run writes the demo video to `docs/media/demo.webm`.
