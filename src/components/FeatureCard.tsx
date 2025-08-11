const FeatureCard = ({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) => (
    <div className="text-center p-6 border border-gray-300 rounded-lg">
        <div className="flex justify-center mb-4">
            <Icon className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
);

export default FeatureCard;
