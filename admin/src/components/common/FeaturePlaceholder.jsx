function FeaturePlaceholder({ title }) {
  return (
    <section className="page-heading">
      <div>
        <p className="eyebrow">NOT IMPLEMENTED</p>
        <h1>{title}</h1>
        <p>This feature is not available in the current backend. No data or operations are simulated.</p>
      </div>
    </section>
  );
}

export default FeaturePlaceholder;
