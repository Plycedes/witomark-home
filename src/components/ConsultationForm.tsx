import React, { useState } from "react";
import { toast } from "react-toastify";

interface Props {
    onClose: () => void;
}

export default function ConsultationForm({ onClose }: Props) {
    const [formData, setFormData] = useState({
        business_name: "",
        email: "",
        phone_number: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`https://api.alemeno.com/api/contact/submit/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Contact information sent successfully!");
                onClose();
            } else {
                toast.error("Failed to send contact information");
            }
        } catch (error) {
            toast.error("An error occurred.");
            console.log(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-15 relative w-120 shadow-lg">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-4xl"
                >
                    ×
                </button>

                <h2 className="text-5xl font-bold mb-6 mt-3 text-left">Tell us about yourself</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-xs text-gray-900">Your business name</label>
                        <input
                            type="text"
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 h-13"
                            placeholder="Abacus Technologies"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-900">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 h-13"
                            placeholder="john@abacus.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-900">
                            Phone number (with country code)
                        </label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full border border-gray-300 px-3 py-2 h-13"
                            placeholder="+XX XXXXXXXXXX"
                            required
                        />
                    </div>

                    <div className="flex justify-center w-full">
                        <button
                            type="submit"
                            className="relative w-85 h-15 mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full overflow-hidden group"
                        >
                            {/* <span className="absolute inset-0 bg-green-700 origin-bottom rounded-full scale-0 transition-all duration-500 ease-out group-hover:scale-100 z-0"></span> */}
                            <span className="relative z-10">Submit</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
