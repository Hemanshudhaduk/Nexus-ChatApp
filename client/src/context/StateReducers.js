// import VoiceCall from "@/components/Call/VoiceCall";

export const reducerCases = {
  SET_USER_INFO: "SET_USER_INFO",
  SET_NEW_USER: "SET_NEW_USER",
  SET_ALL_CONTACTS_PAGE: "SET_ALL_CONTACTS_PAGE",
  CHANGE_CURRENT_CHAT_USER: "CHANGE_CURRENT_CHAT_USER",
  SET_MESSAGES: "SET_MESSAGES",
  SET_SOCKET: "SET_SOCKET",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_MESSAGE_SEARCH: "SET_MESSAGE_SEARCH",
  SET_USER_CONTACTS: "SET_USER_CONTACTS",
  SET_ONLINE_USERS: "SET_ONLINE_USERS",
  UPDATE_UNREAD_COUNT: "UPDATE_UNREAD_COUNT",
  SET_AI_RESPONSE: "SET_AI_RESPONSE",
  SET_VIDEOCALL : "SET_VIDEOCALL",
  SET_VOICECALL : "SET_VOICECALL",
  END_CALL : "END_CALL",
  SET_INCOMING_VOICE_CALL: "SET_INCOMING_VOICE_CALL",
  SET_INCOMING_VIDEO_CALL: "SET_INCOMING_VIDEO_CALL",
  SET_EXIT_CHAT: "SET_EXIT_CHAT",
};

export const initialState = {
  userInfo: undefined,
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  messagesSearch: false,
  userContacts: [],
  onlineUsers: [],
  userContacts: [],
  aiResponses: [],
  videoCall : undefined,
  VoiceCall : undefined,
  incomingVideoCall : undefined,
  incomingVoiceCall : undefined,
  exitChat: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO:
      return { ...state, userInfo: action.userInfo };

    case reducerCases.SET_NEW_USER:
      return { ...state, newUser: action.newUser };

    case reducerCases.SET_ALL_CONTACTS_PAGE:
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };

    case reducerCases.CHANGE_CURRENT_CHAT_USER:
      return {
        ...state,
        currentChatUser: action.user,
      };

    case reducerCases.SET_MESSAGES:
      return { ...state, messages: action.messages };

    case reducerCases.SET_SOCKET:
      return { ...state, socket: action.socket };

    case reducerCases.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.newMessage] };

    case reducerCases.SET_MESSAGE_SEARCH:
      return { ...state, messagesSearch: !state.messagesSearch };

    case reducerCases.SET_USER_CONTACTS:
      return { ...state, userContacts: action.userContacts };

    case reducerCases.SET_ONLINE_USERS:
      return { ...state, onlineUsers: action.onlineUsers };

    case reducerCases.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        userContacts: state.userContacts.map((contact) =>
          contact.id === action.payload.userId
            ? { ...contact, totalUnreadMessages: action.payload.count }
            : contact
        ),
      };

    case reducerCases.SET_AI_RESPONSE:
      return { ...state, aiResponses: [...state.aiResponses, action.response] };

    case reducerCases.SET_VIDEOCALL:
      return { ...state, videoCall: action.videoCall };

    case reducerCases.SET_VOICECALL:
      return { ...state, voiceCall: action.voiceCall };

    case reducerCases.SET_INCOMING_VOICE_CALL:
      return { ...state, incomingVoiceCall: action.incomingVoiceCall };

    case reducerCases.SET_INCOMING_VIDEO_CALL:
      return { ...state, incomingVideoCall: action.incomingVideoCall };

    case reducerCases.END_CALL:
      return {
        ...state,
        videoCall: undefined,
        voiceCall: undefined,
        incomingVoiceCall: undefined,
        incomingVideoCall: undefined,
      };

    case reducerCases.SET_EXIT_CHAT:
      return { ...state,  currentChatUser:undefined};

    default:
      return state;
  }
};

export default reducer;
