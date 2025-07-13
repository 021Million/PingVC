import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function testAirtableFields() {
  try {
    console.log('Testing minimal record creation...');
    
    // Try to create a minimal record with just basic fields
    const minimalRecord = {
      fields: {
        "Name": "Test Investor",
        "Fund": "Test Fund",
        "Verified": true
      }
    };
    
    const result = await base('VCs').create(minimalRecord);
    console.log('Success! Created test record:', result.id);
    
    // Now delete the test record
    await base('VCs').destroy(result.id);
    console.log('Test record deleted');
    
    // Try to fetch existing records to see the structure
    console.log('\nFetching existing records to see field structure...');
    const records = await base('VCs').select({ maxRecords: 1 }).firstPage();
    
    if (records.length > 0) {
      console.log('Existing fields:', Object.keys(records[0].fields));
    } else {
      console.log('No existing records found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nField names in your Airtable table might be different.');
    console.log('Please check the exact field names in your Airtable "VCs" table.');
  }
}

testAirtableFields();