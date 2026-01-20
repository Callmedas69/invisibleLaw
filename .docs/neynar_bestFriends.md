# Best friends

> Returns the best friends of a user ranked by mutual affinity score based on interactions with each other.



## OpenAPI

````yaml get /v2/farcaster/user/best_friends/
openapi: 3.0.4
info:
  title: Neynar API
  version: 3.121.0
  description: >-
    The Neynar API allows you to interact with the Farcaster protocol among
    other things. See the [Neynar docs](https://docs.neynar.com/reference) for
    more details.
  contact:
    name: Neynar
    url: https://neynar.com/
    email: team@neynar.com
servers:
  - url: https://api.neynar.com
security:
  - ApiKeyAuth: []
tags:
  - name: User
    description: Operations related to user
    externalDocs:
      description: More info about user
      url: https://docs.neynar.com/reference/user-operations
  - name: Signer
    description: Operations related to signer
    externalDocs:
      description: More info about signer
      url: https://docs.neynar.com/reference/signer-operations
  - name: Cast
    description: Operations related to cast
    externalDocs:
      description: More info about cast
      url: https://docs.neynar.com/reference/cast-operations
  - name: Feed
    description: Operations related to feed
    externalDocs:
      description: More info about feed
      url: https://docs.neynar.com/reference/feed-operations
  - name: Reaction
    description: Operations related to reaction
    externalDocs:
      description: More info about reaction
      url: https://docs.neynar.com/reference/reaction-operations
  - name: Notifications
    description: Operations related to notifications
    externalDocs:
      description: More info about notifications
      url: https://docs.neynar.com/reference/notifications-operations
  - name: Channel
    description: Operations related to channels
    externalDocs:
      description: More info about channels
      url: https://docs.neynar.com/reference/channel-operations
  - name: Follows
    description: Operations related to follows
    externalDocs:
      description: More info about follows
      url: https://docs.neynar.com/reference/follows-operations
  - name: Storage
    description: Operations related to storage
    externalDocs:
      description: More info about storage
      url: https://docs.neynar.com/reference/storage-operations
  - name: Frame
    description: Operations related to mini apps
  - name: Agents
    description: Operations for building AI agents
  - name: fname
    description: Operations related to fname
  - name: Webhook
    description: Operations related to a webhook
  - name: Action
    description: >-
      Securely communicate and perform actions on behalf of users across
      different apps
    externalDocs:
      description: More info about farcaster actions
      url: https://docs.neynar.com/docs/farcaster-actions-spec
  - name: Subscribers
    description: Operations related to a subscriptions
  - name: Mute
    description: Operations related to a mute
  - name: Block
    description: Operations related to a block
  - name: Ban
    description: Operations related to a ban
  - name: Onchain
    description: Operations related to onchain data
  - name: Login
    description: Operations related to login
  - name: Metrics
    description: Operations related to retrieving metrics
  - name: App Host
    description: Operations related to mini app host notifications
    externalDocs:
      description: More info about mini app host notifications
      url: https://docs.neynar.com/docs/app-host-notifications
paths:
  /v2/farcaster/user/best_friends/:
    get:
      tags:
        - User
      summary: Best friends
      description: >-
        Returns the best friends of a user ranked by mutual affinity score based
        on interactions with each other.
      operationId: get-user-best-friends
      parameters:
        - name: fid
          in: query
          description: The FID of the user
          required: true
          schema:
            type: integer
            minimum: 1
        - name: limit
          in: query
          description: Number of results to fetch
          schema:
            default: 3
            type: integer
            minimum: 1
            maximum: 100
            example: 5
          x-is-limit-param: true
        - name: cursor
          in: query
          description: Pagination cursor
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BestFriendsResponse'
        '400':
          description: Bad Request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ZodError'
        '500':
          description: Server Error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorRes'
      externalDocs:
        url: https://docs.neynar.com/reference/get-user-best-friends
components:
  schemas:
    BestFriendsResponse:
      type: object
      properties:
        users:
          type: array
          items:
            type: object
            properties:
              fid:
                type: integer
              mutual_affinity_score:
                type: number
              username:
                type: string
            required:
              - fid
              - mutual_affinity_score
              - username
        next:
          $ref: '#/components/schemas/NextCursor'
      required:
        - users
      title: BestFriendsResponse
    ZodError:
      type: object
      properties:
        message:
          type: string
          example: Invalid query parameters
        code:
          type: string
          example: InvalidField
        errors:
          type: array
          items:
            type: object
            properties:
              code:
                type: string
              expected:
                type: string
              received:
                type: string
              path:
                type: array
                items:
                  type: string
              message:
                type: string
            required:
              - code
              - expected
              - received
              - path
              - message
      required:
        - message
        - code
        - errors
      title: ZodError
    ErrorRes:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        property:
          type: string
        status:
          type: integer
          format: int32
      required:
        - message
      title: ErrorRes
      description: Details for the error response
    NextCursor:
      type: object
      properties:
        cursor:
          type: string
          nullable: true
      required:
        - cursor
      description: Returns next cursor
      title: NextCursor
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