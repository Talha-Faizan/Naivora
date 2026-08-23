import React from "react";
import Landing from "@/Components/Sections/Home/Landing";
import Collections from "@/Components/Sections/Home/Collections";
import Products from "@/Components/Sections/Home/Products";

const page = () => {
  return (
    <>
      <Landing />
      <Collections />
      <Products />
    </>
  );
};

export default page;
