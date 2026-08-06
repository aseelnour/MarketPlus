import { useTranslation } from "react-i18next";

const Cart = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white">
        {t("pages.cart") || "Cart"}
      </h1>
    </div>
  );
};
export default Cart;
