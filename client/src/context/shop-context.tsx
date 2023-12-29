import { createContext, useState } from "react";

interface IShopContext {}

const defaultVal: IShopContext = {};

export const ShopContext = createContext<IShopContext>(defaultVal);

export const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState<{ string: number } | {}>();
  const contextValue: IShopContext = {};
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
