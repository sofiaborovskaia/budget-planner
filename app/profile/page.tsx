"use client";

import { PageLayout } from "@/app/components/ui/PageLayout";
import { Button } from "@/app/components/ui/Button";

interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

function FormLabel({ htmlFor, children }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm text-gray-900 mb-2">
      {children}
    </label>
  );
}

interface FormInputProps {
  id: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

function FormInput({
  id,
  name,
  type = "text",
  required,
  placeholder,
}: FormInputProps) {
  return (
    <input
      type={type}
      id={id}
      name={name}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
    />
  );
}

interface FormSelectProps {
  id: string;
  name: string;
  children: React.ReactNode;
}

function FormSelect({ id, name, children }: FormSelectProps) {
  return (
    <select
      id={id}
      name={name}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  );
}

export default function ProfilePage() {
  const handleSubmit = async (formData: FormData) => {
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      currency: formData.get("currency") as string,
      payPeriod: formData.get("payPeriod") as string,
    };
    console.log("Form submitted:", data);
    // TODO: Save to backend/state
  };

  return (
    <PageLayout title="Profile Settings">
      <form action={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="fullName">Full Name</FormLabel>
              <FormInput
                id="fullName"
                name="fullName"
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <FormLabel htmlFor="email">Email Address</FormLabel>
              <FormInput
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
              />
            </div>
          </div>
        </section>

        {/* Budget Preferences */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Budget Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="currency">Default Currency</FormLabel>
              <FormSelect id="currency" name="currency">
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel htmlFor="payPeriod">Pay Period</FormLabel>
              <FormSelect id="payPeriod" name="payPeriod">
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </FormSelect>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </PageLayout>
  );
}
