function Footer() {
  return (
    <footer className="border-t border-brand-gray mt-12">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-brand-brown-light">
        © {new Date().getFullYear()} derechos reservados "Ruidito a mate"
      </div>
    </footer>
  );
}

export default Footer;