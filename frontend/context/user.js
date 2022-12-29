import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = (props) => {
	const [user, setUser] = useState(null);

    useEffect(() => {
		const token = localStorage.getItem("auth-token");
		if (!token) return;
		const payloadEncoded = token.split(".")[1];
        const payload = JSON.parse(window.atob(payloadEncoded));
		setUser(payload);
		// TODO get more user info using API call from here as well and store in another user state
	}, []);

	return (
		<UserContext.Provider value={[user, setUser]}>
			{props.children}
		</UserContext.Provider>
	);
};
