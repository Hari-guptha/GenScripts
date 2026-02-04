// MongoDB initialization script
db = db.getSiblingDB('genscripts');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'must be a date and is required'
        }
      }
    }
  }
});

db.createCollection('paperAgents');
db.createCollection('papers');
db.createCollection('llmConfigs');
db.createCollection('sources');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.paperAgents.createIndex({ userId: 1 });
db.paperAgents.createIndex({ createdAt: -1 });
db.papers.createIndex({ agentId: 1 });
db.llmConfigs.createIndex({ userId: 1 });

print('Database initialized successfully');
