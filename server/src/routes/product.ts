import { Router, Request, Response } from "express";
import { ProductModel } from "../models/product";
import { verifyToken } from "./user";
import { UserModel } from "../models/user";
import { ProductErrors, UserErrors } from "../errors";

const router = Router();

router.get("/", verifyToken, async (_, res: Response) => {
  try {
    const products = await ProductModel.find({});

    res.json({ products });
  } catch (err) {
    res.status(400).json({ err });
  }
});

router.post("/checkout", verifyToken, async (req: Request, res: Response) => {
  const { customerID, cartItems } = req.body;
  try {
    const user = await UserModel.findById(customerID);

    const productIDs = Object.keys(cartItems);
    const products = await ProductModel.find({ _id: { $in: productIDs } });

    if (!user) {
      return res.status(400).json({ type: UserErrors.NO_USER_FOUND });
    }
    if (products.length !== productIDs.length) {
      return res.status(400).json({ type: ProductErrors.NO_PRODUCT_FOUND });
    }

    let totalPrice = 0;
    for (const item in cartItems) {
      const product = products.find((product) => String(product._id) === item);
      if (!product) {
        return res.status(400).json({ type: ProductErrors.NO_PRODUCT_FOUND });
      }

      if (product.stockQuantity < cartItems[item]) {
        return res.status(400).json({ type: ProductErrors.NOT_ENOUGH_STOCK });
      }

      totalPrice += product.price * cartItems[item];
    }

    if (user.availableMoney < totalPrice) {
      return res.status(400).json({ type: ProductErrors.NO_AVAILABLE_MONEY });
    }

    user.availableMoney -= totalPrice;
    user.purchasedItems.push(...productIDs);

    await user.save();
    for (const product of products) {
      const purchasedQuantity = cartItems[String(product._id)];
      await ProductModel.updateOne(
        { _id: product._id },
        { $inc: { stockQuantity: -purchasedQuantity } }
      );
    }

    res.json({ purchasedItems: user.purchasedItems });
  } catch (error) {
    console.log(error);
  }
});

router.get(
  "/purchased-items/:customerID",
  verifyToken,
  async (req: Request, res: Response) => {
    const { customerID } = req.params;

    try {
      const user = await UserModel.findById(customerID);

      if (!user) {
        res.status(400).json({ type: UserErrors.NO_USER_FOUND });
      }

      const products = await ProductModel.find({
        _id: { $in: user.purchasedItems },
      });

      res.json({ purchasedItems: products });
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

export { router as productRouter };
