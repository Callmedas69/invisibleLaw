# Mentioning an FID

> Fetch casts mentioning a user.



## OpenAPI

````yaml get /v1/castsByMention
openapi: 3.0.4
info:
  title: Farcaster Hub API
  version: 2.35.0
  description: >
    Perform basic queries of Farcaster state via the REST API of a Farcaster
    hub. See the [Neynar docs](https://docs.neynar.com/reference) for more
    details.
  contact:
    name: Neynar
    url: https://neynar.com/
    email: team@neynar.com
servers:
  - url: https://snapchain-api.neynar.com
security:
  - ApiKeyAuth: []
tags:
  - name: Info
    description: Operations related to hub information.
  - name: Casts
    description: Operations related to casts.
  - name: Reactions
    description: Operations related to reactions.
  - name: Links
    description: Operations related to links.
  - name: UserData
    description: Operations related to user data.
  - name: Fids
    description: Operations related to FIDs.
  - name: Storage
    description: Operations related to storage limits.
  - name: Usernames
    description: Operations related to usernames.
  - name: Verifications
    description: Operations related to verifications.
  - name: OnChainEvents
    description: Operations related to on-chain events.
  - name: Message
    description: Operations related to messages.
  - name: HubEvents
    description: Operations related to hub events.
paths:
  /v1/castsByMention:
    get:
      tags:
        - Casts
      summary: Mentioning an FID
      description: Fetch casts mentioning a user.
      operationId: fetch-casts-mentioning-user
      parameters:
        - name: fid
          in: query
          description: The FID that is mentioned in a cast
          required: true
          schema:
            type: integer
          example: 3
        - $ref: '#/components/parameters/pageSize'
        - $ref: '#/components/parameters/paginationReverse'
        - $ref: '#/components/parameters/pageToken'
      responses:
        '200':
          description: The requested Casts.
          content:
            application/json:
              schema:
                allOf:
                  - type: object
                    required:
                      - messages
                    properties:
                      messages:
                        type: array
                        items:
                          $ref: '#/components/schemas/CastAdd'
                  - $ref: '#/components/schemas/PaginationResponse'
        default:
          $ref: '#/components/responses/ErrorResponse'
      externalDocs:
        description: Fetch casts mentioning a user
        url: https://docs.neynar.com/reference/fetch-casts-mentioning-user
components:
  parameters:
    pageSize:
      name: pageSize
      in: query
      description: Maximum number of messages to return in a single response
      schema:
        type: integer
    paginationReverse:
      name: reverse
      in: query
      description: Reverse the sort order, returning latest messages first
      schema:
        type: boolean
    pageToken:
      name: pageToken
      in: query
      description: >-
        The page token returned by the previous query, to fetch the next page.
        If this parameter is empty, fetch the first page
      schema:
        type: string
  schemas:
    CastAdd:
      allOf:
        - $ref: '#/components/schemas/MessageCommon'
        - type: object
          properties:
            data:
              allOf:
                - $ref: '#/components/schemas/MessageDataCastAdd'
                - type: object
                  properties:
                    type:
                      $ref: '#/components/schemas/MessageType'
                  required:
                    - type
          required:
            - data
    PaginationResponse:
      type: object
      required:
        - nextPageToken
      properties:
        nextPageToken:
          type: string
          format: byte
          pattern: ^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$
          description: >-
            Base64-encoded pagination token for fetching the next page of
            results. An empty value indicates there are no more pages to return.
            Used in conjunction with the pageSize parameter to implement
            pagination across large result sets.
          example: AuzO1V0DtaItCwwa10X6YsfStlynsGWT
    MessageCommon:
      type: object
      properties:
        hash:
          title: Hash digest of data
          pattern: ^0x[0-9a-fA-F]{40}$
          type: string
          example: '0xd2b1ddc6c88e865a33cb1a565e0058d757042974'
        hashScheme:
          $ref: '#/components/schemas/HashScheme'
        signature:
          title: Signature of the hash digest
          pattern: ^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$
          type: string
          format: byte
        signatureScheme:
          $ref: '#/components/schemas/SignatureScheme'
        signer:
          title: Public key or address of the key pair that produced the signature
          pattern: ^0x[0-9a-fA-F]+$
          type: string
      required:
        - hash
        - hashScheme
        - signature
        - signatureScheme
        - signer
    MessageDataCastAdd:
      description: >-
        Represents a new cast (post) being created in the Farcaster network. A
        cast can include text content, mentions of other users, embedded URLs,
        and references to parent posts for replies.
      allOf:
        - $ref: '#/components/schemas/MessageDataCommon'
        - type: object
          required:
            - castAddBody
          properties:
            castAddBody:
              description: >-
                The content and metadata of the new cast, including the text,
                mentions, embeds, and any parent references for replies.
              allOf:
                - $ref: '#/components/schemas/CastAddBody'
    MessageType:
      type: string
      description: >-
        Type of the MessageBody.

        - MESSAGE_TYPE_CAST_ADD: Add a new Cast

        - MESSAGE_TYPE_CAST_REMOVE: Remove an existing Cast

        - MESSAGE_TYPE_REACTION_ADD: Add a Reaction to a Cast

        - MESSAGE_TYPE_REACTION_REMOVE: Remove a Reaction from a Cast

        - MESSAGE_TYPE_LINK_ADD: Add a new Link

        - MESSAGE_TYPE_LINK_REMOVE: Remove an existing Link

        - MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS: Add a Verification of an
        Ethereum Address

        - MESSAGE_TYPE_VERIFICATION_REMOVE: Remove a Verification

        - MESSAGE_TYPE_USER_DATA_ADD: Add metadata about a user

        - MESSAGE_TYPE_USERNAME_PROOF: Add or replace a username proof

        - MESSAGE_TYPE_FRAME_ACTION: A Farcaster Frame action
      default: MESSAGE_TYPE_CAST_ADD
      enum:
        - MESSAGE_TYPE_CAST_ADD
        - MESSAGE_TYPE_CAST_REMOVE
        - MESSAGE_TYPE_REACTION_ADD
        - MESSAGE_TYPE_REACTION_REMOVE
        - MESSAGE_TYPE_LINK_ADD
        - MESSAGE_TYPE_LINK_REMOVE
        - MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS
        - MESSAGE_TYPE_VERIFICATION_REMOVE
        - MESSAGE_TYPE_USER_DATA_ADD
        - MESSAGE_TYPE_USERNAME_PROOF
        - MESSAGE_TYPE_FRAME_ACTION
    ErrorResponse:
      required:
        - code
        - details
        - errCode
        - metadata
        - name
        - presentable
      type: object
      properties:
        errCode:
          type: string
        presentable:
          type: boolean
        name:
          type: string
        code:
          type: integer
        details:
          type: string
        metadata:
          required:
            - errcode
          type: object
          properties:
            errcode:
              type: array
              items:
                type: string
    HashScheme:
      type: string
      description: >
        Type of hashing scheme used to produce a digest of MessageData. -
        HASH_SCHEME_BLAKE3: Default scheme for hashing MessageData
      default: HASH_SCHEME_BLAKE3
      enum:
        - HASH_SCHEME_BLAKE3
    SignatureScheme:
      type: string
      description: |-
        Type of signature scheme used to sign the Message hash
        - SIGNATURE_SCHEME_ED25519: Ed25519 signature (default)
        - SIGNATURE_SCHEME_EIP712: ECDSA signature using EIP-712 scheme
      default: SIGNATURE_SCHEME_ED25519
      enum:
        - SIGNATURE_SCHEME_ED25519
        - SIGNATURE_SCHEME_EIP712
    MessageDataCommon:
      description: >-
        Common properties shared by all Farcaster message types. These
        properties provide essential metadata about the message's origin,
        timing, and network context.
      required:
        - fid
        - network
        - timestamp
      type: object
      properties:
        type:
          $ref: '#/components/schemas/MessageType'
        fid:
          title: Farcaster ID of the user producing the message
          description: >-
            The unique identifier (FID) of the user who created this message.
            FIDs are assigned sequentially when users register on the network
            and cannot be changed.
          type: integer
          format: uint64
          example: 2
        timestamp:
          description: >-
            Seconds since Farcaster Epoch (2021-01-01T00:00:00Z). Used to order
            messages chronologically and determine the most recent state. Must
            be within 10 minutes of the current time when the message is
            created.
          type: integer
          format: int64
          example: 48994466
        network:
          $ref: '#/components/schemas/FarcasterNetwork'
    CastAddBody:
      description: Adds a new Cast
      type: object
      properties:
        embedsDeprecated:
          title: URLs to be embedded in the cast
          type: array
          items:
            type: string
        mentions:
          title: Fids mentioned in the cast
          type: array
          items:
            type: integer
            format: uint64
            example: 2
        parentCastId:
          $ref: '#/components/schemas/CastId'
        parentUrl:
          title: Parent URL
          type: string
          example: chain://eip155:1/erc721:0x39d89b649ffa044383333d297e325d42d31329b2
        text:
          title: Text of the cast
          type: string
        mentionsPositions:
          title: Positions of the mentions in the text
          type: array
          items:
            type: integer
            format: int64
        embeds:
          title: URLs or cast IDs to be embedded in the cast
          type: array
          items:
            $ref: '#/components/schemas/Embed'
      required:
        - embedsDeprecated
        - mentions
        - text
        - mentionsPositions
        - embeds
    FarcasterNetwork:
      type: string
      description: |-
        Farcaster network the message is intended for.
        - FARCASTER_NETWORK_MAINNET: Public primary network
        - FARCASTER_NETWORK_TESTNET: Public test network
        - FARCASTER_NETWORK_DEVNET: Private test network
      default: FARCASTER_NETWORK_MAINNET
      enum:
        - FARCASTER_NETWORK_MAINNET
        - FARCASTER_NETWORK_TESTNET
        - FARCASTER_NETWORK_DEVNET
    CastId:
      description: >-
        A unique identifier for a cast (post) in the Farcaster network,
        consisting of the creator's FID and a hash of the cast's content. This
        combination ensures global uniqueness across all casts.
      required:
        - fid
        - hash
      type: object
      properties:
        fid:
          title: Fid of the user who created the cast
          description: >-
            The Farcaster ID (FID) of the user who created the cast. Required to
            uniquely identify the cast's author in the network.
          type: integer
          format: uint64
          example: 2
        hash:
          $ref: '#/components/schemas/CastHash'
    Embed:
      oneOf:
        - $ref: '#/components/schemas/CastEmbed'
        - $ref: '#/components/schemas/UrlEmbed'
    CastHash:
      description: >-
        A unique hash that identifies a specific cast within the creator's
        posts. Generated using HASH_SCHEME_BLAKE3 of the cast's content.
      pattern: ^0x[0-9a-fA-F]{40}$
      type: string
      example: '0x03aff391a6eb1772b20b4ead9a89f732be75fe27'
    CastEmbed:
      type: object
      properties:
        castId:
          $ref: '#/components/schemas/CastId'
      required:
        - castId
    UrlEmbed:
      type: object
      properties:
        url:
          type: string
          format: uri
      required:
        - url
  responses:
    ErrorResponse:
      description: An unexpected error response.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: API key to authorize requests
      x-default: NEYNAR_API_DOCS

````

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.neynar.com/llms.txt