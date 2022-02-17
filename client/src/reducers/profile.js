import {
  GET_PROFILE,
  UPDATE_PROFILE,
  PROFILE_ERROR,
  CLEAR_PROFILE,
} from "../actions/types";

/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable default-case */
const initialState = {
  profile: null,
  profiles: [],
  repos: [],
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        laoding: false,
      };
    case PROFILE_ERROR:
      return {
        ...state,
        profile: payload,
        laoding: false,
      };
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repos: [],
        loading: false,
      };
    default:
      return state;
  }
}
