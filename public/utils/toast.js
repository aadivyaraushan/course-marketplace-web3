import { toast } from "react-toastify";
import styles from "./toast.module.css";

export const withToast = (promiseToResolve) => {
  toast.promise(promiseToResolve, {
    pending: {
      render() {
        return (
          <div className="p-6 py-2">
            <p className={`mb-2 ${styles.loading}`}>Processing</p>
          </div>
        );
      },
      icon: false,
      closeButton: true,
      type: "info",
    },
    success: {
      render({ data }) {
        return (
          <div>
            <p>Transaction successful!</p>
            <a
              href={`https://ropsten.etherscan.io/tx/${data.transactionHash}`}
              target="_blank"
            >
              <i className="text-indigo-600 text-xs underline">See details</i>
            </a>
          </div>
        );
      },
      // other options
      icon: "🥳",
    },
    error: {
      render({ data }) {
        // When the promise reject, data will contains the error
        return <div>{data.message ?? "Transaction has failed"}</div>;
      },
      icon: "🚫",
    },
  });
};
