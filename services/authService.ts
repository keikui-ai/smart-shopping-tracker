import { User } from '../types';

// This is a MOCK authentication service.
// In a real production app, you would replace this with a real authentication
// provider like Firebase Authentication, Auth0, etc. The function signatures
// are designed to be similar to what Firebase provides, making it easier to swap out.

const USER_STORAGE_KEY = 'currentUser';
const ALL_USERS_STORAGE_KEY = 'allUsers'; // For mock sign-up

// This is a simple in-memory event bus to simulate real-time auth state changes.
const listeners: ((user: User | null) => void)[] = [];

const notifyListeners = (user: User | null) => {
  listeners.forEach(listener => listener(user));
};

export const authService = {
  /**
   * Signs a user up with an email and password.
   * In this mock, it stores the user in localStorage.
   * @param email The user's email.
   * @param password The user's password.
   * @returns A promise that resolves to the created User object.
   */
  async signUp(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));
    
    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_STORAGE_KEY) || '{}');
    if (allUsers[email]) {
      throw new Error("Email already in use.");
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: email,
    };

    // Store the new user and their "password" (in a real app, this would be a hashed password on a server)
    allUsers[email] = { ...newUser, password };
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(allUsers));
    
    // Also sign them in immediately after sign-up
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    notifyListeners(newUser);

    return newUser;
  },

  /**
   * Signs a user in with an email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @returns A promise that resolves to the signed-in User object.
   */
  async signIn(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    const allUsers = JSON.parse(localStorage.getItem(ALL_USERS_STORAGE_KEY) || '{}');
    const storedUser = allUsers[email];

    if (!storedUser || storedUser.password !== password) {
      throw new Error("Invalid email or password.");
    }

    const user: User = { id: storedUser.id, email: storedUser.email };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    notifyListeners(user);

    return user;
  },

  /**
   * Signs the current user out.
   * Clears the user from localStorage and notifies listeners.
   */
  async signOut(): Promise<void> {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 200));

    localStorage.removeItem(USER_STORAGE_KEY);
    notifyListeners(null);
  },

  /**
   * Listens for changes to the authentication state.
   * This mimics the behavior of `firebase.auth().onAuthStateChanged`.
   * @param callback The function to call when the auth state changes.
   * @returns An unsubscribe function.
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Immediately call with the current user
    const currentUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
    callback(currentUser);

    // Add to listeners
    listeners.push(callback);

    // Return an unsubscribe function
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  },
};