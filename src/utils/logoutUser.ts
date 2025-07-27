import Cookies from 'js-cookie';
import { clearAuth } from "@/store/authSlice";

export const logoutUser = async (dispatch: any, router: any) => {
  try {
    // Clear cookies
    Cookies.remove('accessToken');
    Cookies.remove('sessionData'); 
    Cookies.remove('user_session_data');

    // Clear storage
    localStorage.removeItem('user_session_data');
    sessionStorage.clear();

    // Clear redux state
    dispatch(clearAuth());

    // Redirect
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
