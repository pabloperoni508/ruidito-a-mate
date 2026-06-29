const variants = {
  loading: "text-brand-brown-light",
  error: "text-brand-red",
  empty: "text-brand-brown-light",
};

function StateMessage({ type = "empty", message }) {
  return (
    <div className={`text-center py-12 ${variants[type]}`}>
      <p>{message}</p>
    </div>
  );
}

export default StateMessage;