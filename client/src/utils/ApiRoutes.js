// utils/ApiRoutes.js
export const HOST = "http://localhost:3005"; // Make sure this matches the backend server URL

const Auth_ROUTE = `${HOST}/api/auth`;
const MESSAGES_ROUTE = `${HOST}/api/messages`


export const CHECK_USER_ROUTE = `${Auth_ROUTE}/check-user`;

export const ONBOARD_USER_ROUTE = `${Auth_ROUTE}/onboard-user`;

export const GET_ALL_USERS = `${Auth_ROUTE}/get-contacts`

export const ADD_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-message`

export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTE}/get-messages`

export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-image-message`

export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGES_ROUTE}/add-audio-message`
export const GET_INITIAL_CONTACTS_ROUTE = `${MESSAGES_ROUTE}/get-initial-contacts`

export const MARK_READ_ROUTE = `${MESSAGES_ROUTE}/mark-read`

export const TEXT_GENRATED_MESSAGE_GPT = `${MESSAGES_ROUTE}/generate-text`

export const IMAGE_GENRATED_MESSAGE_GPT = `${MESSAGES_ROUTE}/generate-image`

export const GET_CALL_TOKEN = `${Auth_ROUTE}/genrate-token`