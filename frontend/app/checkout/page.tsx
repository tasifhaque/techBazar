"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, ShieldCheck, Truck, Lock, CheckCircle, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import Link from "next/link";
import PriceDisplay from "@/components/PriceDisplay";
import { useI18n } from "@/lib/i18n-context";

interface ShippingForm {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export default function CheckoutPage() {
  const { t } = useI18n();
  const router = useRouter();

  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total);
  const clearCart = useCart((s) => s.clearCart);
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: "", address: "", city: "", state: "", zipCode: "", phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvc: "", name: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) router.push("/login");
    else if (items.length === 0) router.push("/cart");
  }, [authLoading, isAuthenticated, items.length, router]);

  useEffect(() => {
    if (user?.name) setShipping((prev) => ({ ...prev, fullName: user.name }));
  }, [user]);

  if (authLoading || !isAuthenticated) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
    </div>
  );
  if (items.length === 0) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
    </div>
  );

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    setLoading(true); setError("");
    try {
      const { order } = await api.orders.create({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: shipping, paymentMethod,
      });
      clearCart();
      router.push(`/checkout/success?id=${order._id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to place order"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
          <ArrowLeft size={15} /> {t("cart.continue_shopping")}
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
              <ShoppingCart size={20} className="text-[var(--accent)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t("checkout.title")}</h1>
          </div>

          <div className="flex items-center gap-3 mb-10">
            {[
              { key: "shipping", label: t("checkout.shipping") },
              { key: "payment", label: t("checkout.payment") },
              { key: "confirm", label: t("checkout.confirm") },
            ].map((s, i) => {
              const isActive = step === s.key;
              const isDone = s.key === "shipping" && (step === "payment" || step === "confirm");
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive ? "btn-gradient shadow-lg" : isDone ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                  }`}>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {isDone ? "✓" : i + 1}
                    </span>
                    {s.label}
                  </div>
                  {i < 2 && <div className="w-8 h-px bg-[var(--border)]" />}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === "shipping" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck size={18} className="text-[var(--accent)]" />
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("checkout.shipping_address")}</h2>
                  </div>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("checkout.full_name")}</label>
                      <input value={shipping.fullName} onChange={(e) => setShipping((p) => ({ ...p, fullName: e.target.value }))} required
                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("checkout.address")}</label>
                      <input value={shipping.address} onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))} required
                        className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("checkout.city")}</label>
                        <input value={shipping.city} onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))} required
                          className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("checkout.state")}</label>
                        <input value={shipping.state} onChange={(e) => setShipping((p) => ({ ...p, state: e.target.value }))} required
                          className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("checkout.zip_code")}</label>
                        <input value={shipping.zipCode} onChange={(e) => setShipping((p) => ({ ...p, zipCode: e.target.value }))} required
                          className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t("checkout.phone")}</label>
                        <input type="tel" value={shipping.phone} onChange={(e) => setShipping((p) => ({ ...p, phone: e.target.value }))} required
                          className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 btn-gradient rounded-xl font-semibold active:scale-[0.99]">
                      {t("checkout.continue_payment")}
                    </button>
                  </form>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard size={18} className="text-[var(--accent)]" />
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("checkout.payment_method")}</h2>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { value: "credit_card", label: "Credit Card", desc: "Pay with Visa, Mastercard, or Amex" },
                      { value: "paypal", label: "PayPal", desc: "Fast and secure online payments" },
                      { value: "stripe", label: "Stripe", desc: "Pay with card or bank transfer" },
                    ].map((method) => (
                      <label key={method.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? "border-[var(--accent)] bg-[var(--accent-light)]"
                          : "border-[var(--border)] hover:border-[var(--border-hover)]"
                      }`}>
                        <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-[var(--accent)]" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{method.label}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{method.desc}</p>
                        </div>
                        <div className="ml-auto text-[var(--accent)]"><Lock size={16} /></div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "credit_card" && (
                    <div className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border)] mb-6 space-y-4">
                      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Card Details</p>
                      <div>
                        <label className="block text-xs text-[var(--text-tertiary)] mb-1">Card Number</label>
                        <input
                          value={cardInfo.number}
                          onChange={(e) => setCardInfo((p) => ({ ...p, number: e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19) }))}
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">Expiry</label>
                          <input
                            value={cardInfo.expiry}
                            onChange={(e) => setCardInfo((p) => ({ ...p, expiry: e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5) }))}
                            placeholder="MM/YY"
                            className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-tertiary)] mb-1">CVC</label>
                          <input
                            value={cardInfo.cvc}
                            onChange={(e) => setCardInfo((p) => ({ ...p, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                            placeholder="123"
                            className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-tertiary)] mb-1">Cardholder Name</label>
                        <input
                          value={cardInfo.name}
                          onChange={(e) => setCardInfo((p) => ({ ...p, name: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border)] mb-6 flex items-center gap-3">
                    <ShieldCheck size={16} className="text-[var(--accent)] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-secondary)]">Encrypted &amp; Secure</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">This is a demo — no real payment is processed.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep("shipping")} className="px-6 py-3 border border-[var(--border)] rounded-xl text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-tertiary)] transition-all">{t("checkout.back")}</button>
                    <button onClick={() => { setStep("confirm"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1 py-3 btn-gradient rounded-xl font-semibold active:scale-[0.99]">{t("checkout.review_order")}</button>
                  </div>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Truck size={16} className="text-[var(--accent)]" />
                      <h3 className="font-semibold text-[var(--text-primary)]">{t("checkout.shipping_to")}</h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{shipping.fullName}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{shipping.address}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{shipping.phone}</p>
                    <button onClick={() => setStep("shipping")} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium mt-2">Edit</button>
                  </div>
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard size={16} className="text-[var(--accent)]" />
                      <h3 className="font-semibold text-[var(--text-primary)]">{t("checkout.payment_method")}</h3>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] capitalize">{paymentMethod.replace("_", " ")}</p>
                    <button onClick={() => setStep("payment")} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium mt-2">Edit</button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 sticky top-24">
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">{t("checkout.order_summary")}</h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const discounted = item.price * (1 - item.discountPercentage / 100);
                    return (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-[10px]">N/A</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]"><PriceDisplay amount={discounted * item.quantity} /></p>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-[var(--border)] pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                    <span>Subtotal</span><span><PriceDisplay amount={total()} /></span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                    <span>Shipping</span><span className="text-[var(--success)] font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--text-secondary)]">
                    <span>Tax</span><span><PriceDisplay amount={total() * 0.08} /></span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[var(--text-primary)] border-t border-[var(--border)] pt-2 mt-2">
                    <span>Total</span><span><PriceDisplay amount={total() * 1.08} /></span>
                  </div>
                </div>
                {step === "confirm" && (
                  <div className="space-y-3 mt-6">
                    {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}
                    <button onClick={handlePlaceOrder} disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 btn-gradient rounded-xl disabled:opacity-50 active:scale-[0.99]">
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle size={18} /> Place Order — <PriceDisplay amount={total() * 1.08} /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
