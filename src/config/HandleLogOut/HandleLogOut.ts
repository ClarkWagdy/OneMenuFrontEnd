import { SetUser } from "../Store/User/UserSlice";

export function HandleLogOut(dispatch:Function) {
  localStorage.clear();
  window.location.reload();
  dispatch(SetUser(null));
}