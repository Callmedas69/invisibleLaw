3:16:41.720 
23:16:41.720 
./app/context/MiniAppContext.tsx:142:11
23:16:41.721 
Type error: Type 'string[] | undefined' is not assignable to type '[string, string] | [] | [string] | undefined'.
23:16:41.721 
  Type 'string[]' is not assignable to type '[string, string] | [] | [string] | undefined'.
23:16:41.721 
    Type 'string[]' is not assignable to type '[string, string] | [] | [string]'.
23:16:41.721 
      Type 'string[]' is not assignable to type '[string]'.
23:16:41.721 
        Target requires 1 element(s) but source may have fewer.
23:16:41.721 
23:16:41.721 
  140 |         const result = await sdk.actions.composeCast({
23:16:41.722 
  141 |           text: options.text,
23:16:41.722 
> 142 |           embeds: options.embeds,
23:16:41.722 
      |           ^
23:16:41.722 
  143 |         });
23:16:41.722 
  144 |         // Return the cast hash if successful
23:16:41.722 
  145 |         return result?.cast?.hash ?? null;
23:16:41.783 
Next.js build worker exited with code: 1 and signal: null
23:16:41.838 
Error: Command "npm run build" exited with 1