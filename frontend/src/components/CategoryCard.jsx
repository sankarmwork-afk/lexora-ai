function CategoryCard({ icon, title, description }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-transparent bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl">
      <div className="flex justify-center text-5xl text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 text-center text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-center text-gray-600">
        {description}
      </p>
    </div>
  );
}

export default CategoryCard;