import React from 'react';
import { Truck, ShieldCheck, BadgeCheck, Headset } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Truck size={38} strokeWidth={1} className="text-[#AF8B57]" />,
      title: "FAST & SECURE",
      subtitle: "DELIVERY"
    },
    {
      icon: <ShieldCheck size={38} strokeWidth={1} className="text-[#AF8B57]" />,
      title: "100% SECURE",
      subtitle: "PAYMENT"
    },
    {
      icon: <BadgeCheck size={38} strokeWidth={1} className="text-[#AF8B57]" />,
      title: "PREMIUM",
      subtitle: "QUALITY"
    },
    {
      icon: <Headset size={38} strokeWidth={1} className="text-[#AF8B57]" />,
      title: "24X7 CUSTOMER",
      subtitle: "SUPPORT"
    }
  ];

  return (
    <div className="w-full py-10 md:py-14 bg-[#0d0d0d] border-y border-[#AF8B57]/20 my-10">
      <div className="max-w-screen-2xl mx-auto px-5">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12 lg:gap-20">
          {services.map((service, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-5 w-full md:w-auto justify-center md:justify-start">
                <div className="flex-shrink-0">
                  {service.icon}
                </div>
                <div className="flex flex-col text-[#e4dccf]">
                  <span className="text-xs sm:text-sm font-medium tracking-[0.15em] leading-tight whitespace-nowrap">{service.title}</span>
                  <span className="text-xs sm:text-sm font-medium tracking-[0.15em] leading-tight whitespace-nowrap">{service.subtitle}</span>
                </div>
              </div>
              {/* Divider */}
              {index < services.length - 1 && (
                <div className="hidden md:block w-px h-12 bg-[#AF8B57]/30"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;