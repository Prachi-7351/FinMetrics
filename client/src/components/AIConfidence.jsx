const AIConfidence = ({ score }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold mb-3">AI Confidence Score</h3>

      <div className="w-full bg-gray-200 h-4 rounded-full">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">
        AI confidence in financial analysis: <b>{score}%</b>
      </p>
    </div>
  );
};

export default AIConfidence;