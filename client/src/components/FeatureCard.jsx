const FeatureCard = ({ step, icon, title, description, color = 'green', delay = 0 }) => {
  return (
    <div className="feature-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className={`feature-card-icon ${color}`}>
        {icon}
      </div>
      {step && <div className="feature-card-step">Step {step}</div>}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
