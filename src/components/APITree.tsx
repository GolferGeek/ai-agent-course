import { useState } from 'react';
import styles from './APITree.module.css';
import APIPlayground from './APIPlayground';

interface APIMetadata {
  name: string;
  endpoint: string;
  description: string;
  method: string;
  parameters: Record<string, {
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Record<string, {
    description: string;
    content?: Record<string, {
      type: string;
      description: string;
    }>;
  }>;
}

interface APICategory {
  name: string;
  description: string;
  apis: APIMetadata[];
}

interface APITreeProps {
  categories: APICategory[];
}

const APIStructureView = ({ api }: { api: APIMetadata }) => (
  <div className={styles.apiStructure}>
    <h3>{api.name}</h3>
    <div className={styles.metadata}>
      <div className={styles.metadataItem}>
        <strong>Endpoint:</strong> {api.endpoint}
      </div>
      <div className={styles.metadataItem}>
        <strong>Method:</strong> {api.method}
      </div>
      <div className={styles.metadataItem}>
        <strong>Description:</strong> {api.description}
      </div>
      
      <h4>Parameters</h4>
      <div className={styles.parameters}>
        {Object.entries(api.parameters).map(([name, param]) => (
          <div key={name} className={styles.parameter}>
            <div className={styles.parameterName}>
              {name}
              {param.required && <span className={styles.required}>*</span>}
            </div>
            <div className={styles.parameterDetails}>
              <div><strong>Type:</strong> {param.type}</div>
              <div><strong>Description:</strong> {param.description}</div>
            </div>
          </div>
        ))}
      </div>

      <h4>Response Structures</h4>
      <div className={styles.responses}>
        {Object.entries(api.responses).map(([code, response]) => (
          <div key={code} className={styles.response}>
            <div className={styles.responseCode} data-code={code}>{code}</div>
            <div className={styles.responseDescription}>
              <div>{response.description}</div>
              {response.content && (
                <pre className={styles.responseExample}>
                  {JSON.stringify(
                    Object.fromEntries(
                      Object.entries(response.content).map(([key, schema]) => [
                        key,
                        schema.type === 'array' ? 
                          [{ example: 'value' }] : 
                          schema.type === 'string' ? 
                            'example value' : 
                            schema.type === 'number' ? 
                              123 : 
                              { example: 'value' }
                      ])
                    ),
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TreeNode = ({ 
  name, 
  isCategory = false,
  onView,
  onGo 
}: { 
  name: string;
  isCategory?: boolean;
  onView?: () => void;
  onGo?: () => void;
}) => (
  <div className={styles.treeNode}>
    <div className={styles.nodeContent}>
      {!isCategory && (
        <div className={styles.nodeButtons}>
          <button
            className={`${styles.button} ${styles.viewButton}`}
            onClick={onView}
            title="View API structure"
          >
            V
          </button>
          <button
            className={`${styles.button} ${styles.goButton}`}
            onClick={onGo}
            title="Try API"
          >
            G
          </button>
        </div>
      )}
      <span className={styles.nodeName}>{name}</span>
    </div>
  </div>
);

const APITree: React.FC<APITreeProps> = ({ categories }) => {
  const [selectedAPI, setSelectedAPI] = useState<{
    category: string;
    api: APIMetadata;
    mode: 'view' | 'go';
  } | null>(null);

  return (
    <div className={styles.treeContainer}>
      <div className={styles.tree}>
        <div className={styles.rootNode}>
          <h2>API Directory</h2>
          {categories.map((category) => (
            <div key={category.name} className={styles.treeNode}>
              <TreeNode name={category.name} isCategory />
              <div className={styles.nodeChildren}>
                {category.apis.map((api) => (
                  <TreeNode
                    key={api.name}
                    name={api.name}
                    onView={() => setSelectedAPI({
                      category: category.name,
                      api,
                      mode: 'view'
                    })}
                    onGo={() => setSelectedAPI({
                      category: category.name,
                      api,
                      mode: 'go'
                    })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {selectedAPI ? (
          <>
            <div className={styles.contentHeader}>
              <h3>{selectedAPI.api.name}</h3>
              <span className={styles.breadcrumb}>
                {selectedAPI.category} / {selectedAPI.api.name}
              </span>
            </div>
            {selectedAPI.mode === 'view' ? (
              <APIStructureView api={selectedAPI.api} />
            ) : (
              <APIPlayground metadata={selectedAPI.api} />
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            <h3>Select an API to view its details or try it out</h3>
            <p>Click "V" to view the API structure or "G" to open the playground</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITree; 