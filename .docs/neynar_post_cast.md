Posting Casts with Mentions
When publishing a cast via the POST /v2/farcaster/cast endpoint, you simply include the @username in your text. The API handles the mention automatically.

Example using the Node.js SDK:

const cast = await neynarClient.publishCast({
  signerUuid: body.signer_uuid, 
  text: "Hey @username check this out!"
});
The API will parse the @username syntax and convert it to a proper Farcaster mention. The response includes mentioned_profiles with details about the mentioned users.

Want to know more? These pages may help: