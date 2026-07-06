"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import emailjs from "@emailjs/browser";
import Footer from "@/components/Footer";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState("");

  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [requirementsError, setRequirementsError] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Pre-fill requirements if there's a plan parameter in the URL
  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      setRequirements(planParam);
    }
  }, [searchParams]);

  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!name.trim() || name.trim().length < 2) {
        setNameError(true);
        return false;
      }
      setNameError(false);
      return true;
    }
    if (currentStep === 2) {
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setEmailError(true);
        return false;
      }
      setEmailError(false);
      return true;
    }
    if (currentStep === 3) {
      if (!requirements.trim()) {
        setRequirementsError(true);
        return false;
      }
      setRequirementsError(false);
      return true;
    }
    return true;
  };

  const handleNext = (currentStep: number) => {
    if (!validateStep(currentStep)) return;
    setStep(currentStep + 1);
  };

  const handleBack = (currentStep: number) => {
    setStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    setStep(4); // Loading step
    setSubmitError(false);

    const serviceID = "service_ofkyvkj";
    const ownerTemplateID = "template_wde8ap8";
    const customerTemplateID = "template_ra3xg1j";
    const publicKey = "RmZcGlTCvJXQ5yflQ";

    emailjs.init(publicKey);

    const templateParams = {
      name: name.trim(),
      email: email.trim(),
      selectedServices: requirements.trim(),
    };

    const sendOwner = emailjs.send(serviceID, ownerTemplateID, templateParams);
    const sendCustomer = emailjs.send(serviceID, customerTemplateID, templateParams);

    Promise.all([sendOwner, sendCustomer])
      .then(() => {
        setStep(5); // Success step
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setSubmitError(true);
        setStep(3); // Roll back to step 3 on error
      });
  };

  return (
    <div className="w-full max-w-4xl z-10 relative">
      <h2 className="text-xs uppercase tracking-[0.3em] text-[#7a0e0e] mb-20 text-center font-bold">
        Start the Project
      </h2>
      <div id="form-container" className="relative min-h-[350px]">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="form-step animate-[fadeIn_0.5s_ease]">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-6 font-semibold">
              Step 01 / 03
            </label>
            <h3 className="serif text-4xl md:text-7xl mb-12 leading-tight">
              What should we
              <br />
              call you?
            </h3>
            <input
              type="text"
              id="input-name"
              placeholder="Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(false);
              }}
              className={`w-full bg-transparent border-b text-2xl md:text-6xl py-4 md:py-8 text-white placeholder-neutral-800 focus:outline-none focus:border-[#7a0e0e] transition-colors duration-300 hover-trigger ${
                nameError ? "input-error border-[#7a0e0e]" : "border-white/20"
              }`}
            />
            <span className={`field-error ${nameError ? "visible" : ""}`}>
              Please enter your name (at least 2 characters).
            </span>
            <div className="flex justify-end mt-12">
              <button
                onClick={() => handleNext(1)}
                className="group flex items-center gap-4 text-xs uppercase tracking-widest hover:text-[#7a0e0e] transition hover-trigger cursor-pointer font-bold"
              >
                Next Step{" "}
                <span className="text-2xl group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="form-step animate-[fadeIn_0.5s_ease]">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-6 font-semibold">
              Step 02 / 03
            </label>
            <h3 className="serif text-4xl md:text-7xl mb-12 leading-tight">
              Where can we
              <br />
              reach you?
            </h3>
            <input
              type="email"
              id="input-email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              className={`w-full bg-transparent border-b text-2xl md:text-6xl py-4 md:py-8 text-white placeholder-neutral-800 focus:outline-none focus:border-[#7a0e0e] transition-colors duration-300 hover-trigger ${
                emailError ? "input-error border-[#7a0e0e]" : "border-white/20"
              }`}
            />
            <span className={`field-error ${emailError ? "visible" : ""}`}>
              Please enter a valid email address.
            </span>
            <div className="flex justify-between items-center mt-12">
              <button
                onClick={() => handleBack(2)}
                className="group flex items-center gap-4 text-xs uppercase tracking-widest hover:text-[#7a0e0e] transition hover-trigger cursor-pointer font-bold"
              >
                <span className="text-2xl group-hover:-translate-x-2 transition-transform">
                  ←
                </span>{" "}
                Back
              </button>
              <button
                onClick={() => handleNext(2)}
                className="group flex items-center gap-4 text-xs uppercase tracking-widest hover:text-[#7a0e0e] transition hover-trigger cursor-pointer font-bold"
              >
                Next Step{" "}
                <span className="text-2xl group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="form-step animate-[fadeIn_0.5s_ease]">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-6 font-semibold">
              Step 03 / 03
            </label>
            <h3 className="serif text-4xl md:text-7xl mb-12 leading-tight">
              Tell us about
              <br />
              your story.
            </h3>
            <input
              type="text"
              id="input-requirements"
              placeholder="Your requirements..."
              value={requirements}
              onChange={(e) => {
                setRequirements(e.target.value);
                setRequirementsError(false);
              }}
              className={`w-full bg-transparent border-b text-2xl md:text-4xl py-4 md:py-8 text-white placeholder-neutral-800 focus:outline-none focus:border-[#7a0e0e] transition-colors duration-300 hover-trigger ${
                requirementsError ? "input-error border-[#7a0e0e]" : "border-white/20"
              }`}
            />
            <span className={`field-error ${requirementsError ? "visible" : ""}`}>
              Please tell us about your story.
            </span>
            {submitError && (
              <span className="text-xs uppercase tracking-widest text-[#7a0e0e] mt-4 block">
                Something went wrong. Please try again.
              </span>
            )}
            <div className="flex justify-between items-center mt-12">
              <button
                onClick={() => handleBack(3)}
                className="group flex items-center gap-4 text-xs uppercase tracking-widest hover:text-[#7a0e0e] transition hover-trigger cursor-pointer font-bold"
              >
                <span className="text-2xl group-hover:-translate-x-2 transition-transform">
                  ←
                </span>{" "}
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-12 py-4 bg-[#7a0e0e] text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition duration-300 hover-trigger cursor-pointer"
              >
                Submit Inquiry
              </button>
            </div>
          </div>
        )}

        {/* LOADING STEP */}
        {step === 4 && (
          <div className="form-step text-center flex flex-col items-center justify-center min-h-[300px] animate-[fadeIn_0.5s_ease]">
            <div className="loader-pulse-dot w-[6px] h-[6px] rounded-full bg-[#7a0e0e] animate-[loaderPulse_1.4s_ease-in-out_infinite] mb-8" />
            <div className="loader-line w-[120px] h-[2px] bg-white/8 relative overflow-hidden rounded-[2px] mb-10">
              <div className="absolute top-0 left-[-40%] w-[40%] h-full bg-[#7a0e0e] rounded-[2px] animate-[loaderSlide_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Transmitting</p>
            <p className="serif text-2xl md:text-4xl text-white/85">Hold tight.</p>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 5 && (
          <div className="form-step text-center flex flex-col items-center justify-center min-h-[300px] animate-[fadeIn_0.5s_ease]">
            <h3 className="serif text-5xl md:text-8xl mb-6 text-white leading-tight">Received.</h3>
            <p className="text-gray-400 text-lg md:text-xl uppercase tracking-widest">
              We&apos;ll take it from here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <div className="noise-overlay" />
      <main className="relative w-full min-h-screen bg-black select-none">
        <section
          id="contact"
          className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-20 px-6"
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <Suspense
            fallback={
              <div className="text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="loader-pulse-dot w-[6px] h-[6px] rounded-full bg-[#7a0e0e] animate-[loaderPulse_1.4s_ease-in-out_infinite] mb-8" />
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Loading Form</p>
              </div>
            }
          >
            <ContactFormContent />
          </Suspense>
        </section>
        <div className="relative z-20">
          <Footer />
        </div>
      </main>
    </>
  );
}
