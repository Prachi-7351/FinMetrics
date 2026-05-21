const RecommendationCard = ({ title, description, priority, onClick }) => {
  const colors = {
    high: "border-red-500 bg-red-50",
    medium: "border-yellow-500 bg-yellow-50",
    low: "border-green-500 bg-green-50",
  };

  return (
    <div
      onClick={onClick}
      className={`border-l-4 p-4 rounded-lg shadow cursor-pointer hover:scale-[1.02] transition ${colors[priority]}`}
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default RecommendationCard;