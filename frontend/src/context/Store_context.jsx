import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { initSocket, disconnectSocket } from "../services/socket";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
    const [cartitems, setcartitems] = useState({});
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [token, settoken] = useState(localStorage.getItem("token") || null);
    const [food_list, setfood_list] = useState([])
    const [menu_list, setmenu_list] = useState([])
    const [socket, setSocket] = useState(null);
    const [currency, setCurrency] = useState("₹");
    const [deliveryfee, setDeliveryFee] = useState(2);

    useEffect(() => {
        if (token) {
            const newSocket = initSocket(token, 'customer');
            setSocket(newSocket);
            
            // Global listeners for real-time notifications
            newSocket.on("order:accepted", (order) => toast.info("Your order has been accepted!"));
            newSocket.on("order:preparing", (order) => toast.warn("Your food is now being prepared!"));
            newSocket.on("order:ready", (order) => toast.success("Your order is ready for pickup!"));
            newSocket.on("order:completed", (order) => toast.success("Order completed! Enjoy your meal!"));

            return () => {
                newSocket.off("order:accepted");
                newSocket.off("order:preparing");
                newSocket.off("order:ready");
                newSocket.off("order:completed");
                disconnectSocket();
            };
        }
    }, [token]);

    //add to cart...

    const addtocart = async (itemid) => {
        if (!cartitems[itemid]) {
            setcartitems((prev) => ({ ...prev, [itemid]: 1 }))
        }
        else {
            setcartitems((prev) => ({ ...prev, [itemid]: prev[itemid] + 1 }))
        }
        if (token) {
            await axios.post(url + "/api/cart/add/", { itemid }, { headers: { token } })
            // Log behavior silently
            axios.post(url + "/api/recommendations/behavior", { action: 'ADD_TO_CART', foodId: itemid }, { headers: { token } }).catch(e => {});
        }
    }
    //remove from cart...
    const removefromcart = async (itemid) => {
        setcartitems((prev) => ({ ...prev, [itemid]: prev[itemid] - 1 }));
        if (token) {
            await axios.post(url + "/api/cart/remove/", { itemid }, { headers: { token } })
        }
    }
    //gettotalamount....
    const gettotalamount = () => {
        let totalamount = 0;
        for (const item in cartitems) {
            if (cartitems[item] > 0) {
                let iteminfo = food_list.find((product) => product._id === item);
                totalamount += iteminfo.price * cartitems[item];
            }
        }
        return totalamount;
    }
    const contextValue = {
        food_list,
        cartitems,
        setcartitems,
        addtocart,
        removefromcart,
        gettotalamount,
        url,
        token,
        settoken,
        menu_list,
        socket,
        currency,
        deliveryfee
    }
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            const foods = response?.data?.data || [];
            setfood_list(foods);
        } catch (error) {
            console.error("Failed to fetch food list", error);
            setfood_list([]);
        }
    }
    const fetchmenulist = async () => {
        const response = await axios.get(url + "/api/menu/list")
        if (response.data.success) {
            setmenu_list(response.data.data)
        }
    }
    const loadcartdata = async (token) => {
    const apiUrl = `${url}/api/cart/get`;
    console.log("Calling:", apiUrl);

    const response = await axios.post(apiUrl, {}, {
        headers: { token }
    });

    setcartitems(response.data.cartdata);
};
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            await fetchmenulist();
            if (localStorage.getItem("token")) {
                settoken(localStorage.getItem("token"));
                await loadcartdata(localStorage.getItem("token"));
            }
        }
        loadData();
    }, [])

    useEffect(() => {
        console.log(cartitems);
    }, [cartitems]
    )
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;