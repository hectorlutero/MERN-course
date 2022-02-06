import { GET_PROFILE, PROFILE_ERROR } from "../actions/types";

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
      return {
        ...state,
        profile: payload,
        laoding: true,
      };
    case PROFILE_ERROR:
      return {
        ...state,
        profile: payload,
        laoding: false,
      };
    default:
      return state;
  }
}
