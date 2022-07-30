import { useEffect, useState } from "react";
import Modal from "..";
import Button from "../../button/index";
import { useEthPrice } from "../../../../hooks/useEthPrice";

const defaultOrder = {
  price: "",
  email: "",
  confirmationEmail: "",
};

const createFormState = (
  { price, email, confirmationEmail },
  agreedToTerms,
  isNewPurchase
) => {
  // return {
  //     isDisabled: !price || Number(price) === 0 || email !== confirmationEmail || !email || !confirmationEmail,
  //     message: email !== confirmationEmail ? "Email addresses do not match" : Number(price) === 0 ? "Price must be greater than 0" : (!price || !email || !confirmationEmail) ? "Please fill in all fields" : !agreedToTerms && "You must agree to the terms and conditions"
  //
  // }
  console.log(isNewPurchase);
  if (!price || Number(price) <= 0) {
    return { isDisabled: true, message: "Price must be greater than zero" };
  }

  if (isNewPurchase) {
    console.log("Check activated");
    if (confirmationEmail.length === 0 || email.length === 0) {
      return { isDisabled: true, message: "Please enter an email" };
    } else if (email !== confirmationEmail) {
      return { isDisabled: true, message: "Emails do not match" };
    }
  }

  if (!agreedToTerms) {
    return {
      isDisabled: true,
      message: "Please agree to the terms of service",
    };
  }

  return { isDisabled: false };
};

const OrderModal = ({ course, onClose, onSubmit, isNewPurchase }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState(defaultOrder);
  const [enabled, setEnabled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formState, setFormState] = useState(
    createFormState(order, agreedToTerms, isNewPurchase)
  );
  const { ethPerItem } = useEthPrice();

  useEffect(() => {
    if (!!course) {
      setIsOpen(true);
      setOrder({
        ...order,
        price: ethPerItem,
      });
    }
  }, [course]);

  useEffect(() => {
    setFormState(createFormState(order, agreedToTerms, isNewPurchase));
  }, [order, agreedToTerms]);

  return (
    <Modal activated={isOpen}>
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                className="mb-7 text-lg font-bold leading-6 text-gray-900"
                id="modal-title"
              >
                {course.title}
              </h3>
              <div className="mt-1 relative rounded-md">
                <div className="mb-1">
                  <label className="mb-2 font-bold">Price(eth)</label>
                  <div className="text-xs text-gray-700 flex">
                    <label className="flex items-center mr-2">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          setEnabled(!enabled);
                          setOrder({
                            ...order,
                            price: e.target.checked ? order.price : ethPerItem,
                          });
                        }}
                      />
                    </label>
                    <span>
                      Adjust Price - only when the price is not correct
                    </span>
                  </div>
                </div>
                <input
                  value={Number(order.price)}
                  disabled={!enabled}
                  onChange={(e) => {
                    if (isNaN(Number(e.target.value))) return;
                    setOrder({
                      ...order,
                      price: e.target.value,
                    });
                  }}
                  type="text"
                  name="price"
                  id="price"
                  className="disabled:opacity-50 w-80 mb-1 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-700">
                  Price will be verified at the time of the order. If the price
                  will be lower, order can be declined (± 2% slippage is
                  allowed)
                </p>
              </div>
              {isNewPurchase && (
                <>
                  <div className="mt-2 relative rounded-md">
                    <div className="mb-1">
                      <label className="mb-2 font-bold">Email</label>
                    </div>
                    <input
                      onChange={(e) => {
                        setOrder({
                          ...order,
                          email: e.target.value.trim(),
                        });
                      }}
                      type="email"
                      name="email"
                      id="email"
                      className="w-80 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
                      placeholder="x@y.com"
                    />
                    <p className="text-xs text-gray-700 mt-1">
                      It&apos;s important to fill a correct email, otherwise the
                      order cannot be verified. We are not storing your email
                      anywhere
                    </p>
                  </div>
                  <div className="my-2 relative rounded-md">
                    <div className="mb-1">
                      <label className="mb-2 font-bold">Repeat Email</label>
                    </div>
                    <input
                      onChange={(e) => {
                        setOrder({
                          ...order,
                          confirmationEmail: e.target.value.trim(),
                        });
                      }}
                      type="email"
                      name="confirmationEmail"
                      id="confirmationEmail"
                      className="w-80 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
                      placeholder="x@y.com"
                    />
                  </div>
                </>
              )}
              <div className="text-xs text-gray-700 flex mt-3">
                <label className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                    }}
                  />
                </label>
                <span>
                  I accept Eincode &apos;terms of service&apos; and I agree that
                  my order can be rejected in the case data provided above are
                  not correct
                </span>
              </div>
              {formState.message && (
                <p className="text-base text-red-800 bg-red-200 rounded-lg p-4 mt-4">
                  {formState.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex justify-around">
          <Button
            disabled={formState.isDisabled}
            onClick={() => onSubmit(order, course)}
          >
            Submit
          </Button>
          <Button
            variant="red"
            onClick={() => {
              setIsOpen(false);
              setOrder(defaultOrder);
              setEnabled(false);
              setAgreedToTerms(false);
              onClose();
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderModal;
