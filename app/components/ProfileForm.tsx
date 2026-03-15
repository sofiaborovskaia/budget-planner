"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { updateUserProfile } from "@/lib/actions/user";

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;

      await updateUserProfile(name, email);
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={initialData.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={initialData.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>
      </section>

      {/* Budget Preferences - Commented out for now */}
      {/* 
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Budget Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currency" className="block text-sm mb-2">
              Default Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div>
            <label htmlFor="payPeriod" className="block text-sm mb-2">
              Pay Period
            </label>
            <select
              id="payPeriod"
              name="payPeriod"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </section>
      */}

      {/* Save Button */}
      <div className="pt-4 space-y-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </form>
  );
}
