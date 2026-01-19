./app/context/MiniAppContext.tsx:68:22
Type error: Argument of type 'Promise<boolean>' is not assignable to parameter of type 'SetStateAction<boolean>'.
  66 |         // Check if we're inside a Farcaster miniapp
  67 |         const inMiniApp = sdk.isInMiniApp();
> 68 |         setIsMiniApp(inMiniApp);
     |                      ^
  69 |
  70 |         if (inMiniApp) {
  71 |           // Get the context (user info, etc.)
Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1