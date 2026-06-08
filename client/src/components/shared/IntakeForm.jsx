import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

const KNOWN_SKILLS = [
  'Sit','Down','Stay','Come when called','Leave it','Drop it',
  'Loose leash walking','Heel','Crate training','Place','Paw',
  'Spin','Roll Over','Any rear end awareness (Perch & Pivot, Orbit, Back up)'
];

const GEAR_OPTIONS = [
  'Flat collar','Martingale','Harness','Prong collar',
  'E-collar','Gentle Leader / Head Halter'
];

const LOCATIONS = [
  'At home','Park or outdoor space','Open to location suggestions',
  'I have a spot where my dog can safely be off leash for training',
  'At Paisley Dog Gear and Training Location in the North End of Boston'
];

export default function IntakeForm({ dog, existingData, onSaved, onCancel, readOnly }) {
  const { apiFetch } = useApi();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(existingData || {
    // Section 2: Owner & Dog Info
    owner_phone: '', dog_weight: '',
    // Section 3: Health & Lifestyle
    medical_conditions: '', food_restrictions: '', typical_day: '',
    hours_alone: '', home_setup: '',
    // Section 4: Background
    dog_background: '', rescue_history: '',
    // Section 5: Training History
    prior_training: '', socialization: '',
    known_skills: [], known_skills_other: '',
    marker_type: '', marker_other: '',
    has_release_command: '', release_command_other: '',
    // Section 6: Behavior
    public_behavior: '', struggles_and_strengths: '',
    other_concerns: '',
    has_bitten: '', bite_details: '',
    handling_comfort: '', handling_other: '',
    resource_guarding: '', resource_guarding_other: '',
    // Section 7: Tools & Motivation
    gear_used: [], gear_other: '',
    highest_value_reward: '', favorite_treat_toy: '',
    // Section 8: Goals & Logistics
    training_goals: '', tricks_to_learn: '',
    owner_confidence: '',
    preferred_locations: [], preferred_locations_other: '',
    city: '', upcoming_event: '', anything_else: '',
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function toggleArray(key, val) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val]
    }));
  }

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      await apiFetch(`/api/dogs/${dog.id}/intake`, {
        method: 'PATCH',
        body: JSON.stringify({ intake_data: form }),
      });
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  const inp = {
    width:'100%', padding:'9px 12px', borderRadius:'var(--radius-sm)',
    border:'1.5px solid var(--gray-border)', fontSize:14, outline:'none',
    fontFamily:'var(--font-sans)', color:'var(--brown)', background: readOnly ? 'var(--cream)' : 'var(--white)',
    resize:'vertical', transition:'border-color .15s'
  };
  const label = { fontSize:14, color:'var(--brown)', fontWeight:500, display:'block', marginBottom:6, lineHeight:1.4 };
  const sub = { fontSize:12, color:'var(--gray-text)', marginBottom:6, display:'block' };
  const section = (title) => (
    <div style={{ marginBottom:8 }}>
      <div className="section-label">{title}</div>
    </div>
  );
  const field = (children) => <div style={{ marginBottom:18 }}>{children}</div>;

  const RadioGroup = ({ name, options, value, onChange }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(opt => (
        <label key={opt} style={{ display:'flex', alignItems:'center', gap:8, cursor: readOnly ? 'default' : 'pointer', fontSize:14, color:'var(--brown)' }}>
          <input type="radio" name={name} value={opt} checked={value===opt} onChange={() => !readOnly && onChange(opt)}
            style={{ accentColor:'var(--teal)', width:16, height:16 }} />
          {opt}
        </label>
      ))}
    </div>
  );

  const CheckGroup = ({ name, options, values, onChange, otherKey, otherValue, onOtherChange }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(opt => (
        <label key={opt} style={{ display:'flex', alignItems:'center', gap:8, cursor: readOnly ? 'default' : 'pointer', fontSize:14, color:'var(--brown)' }}>
          <input type="checkbox" checked={values.includes(opt)} onChange={() => !readOnly && onChange(opt)}
            style={{ accentColor:'var(--teal)', width:16, height:16 }} />
          {opt}
        </label>
      ))}
      {otherKey && (
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:'var(--brown)' }}>
          <input type="checkbox" checked={!!otherValue} onChange={() => !readOnly && onOtherChange(otherValue ? '' : ' ')}
            style={{ accentColor:'var(--teal)', width:16, height:16 }} />
          Other:
          <input value={otherValue||''} onChange={e => !readOnly && onOtherChange(e.target.value)}
            style={{ ...inp, width:'auto', flex:1, padding:'4px 8px' }} placeholder="specify..." />
        </label>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth:680 }}>
      {!readOnly && (
        <div style={{ background:'var(--teal-light)', border:'1px solid var(--teal)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:24, fontSize:13, color:'var(--teal-dark)' }}>
          This helps your trainer get to know {dog.name} before your first session. Fill in what you can — leave anything blank that doesn't apply.
        </div>
      )}

      {/* Section 2: Owner & Dog Info */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Owner & Dog Info')}
        {field(<>
          <label style={label}>Phone Number</label>
          <input style={inp} value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} placeholder="Your phone number" disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Dog's Approximate Weight</label>
          <input style={inp} value={form.dog_weight} onChange={e => set('dog_weight', e.target.value)} placeholder="e.g. 35 lbs" disabled={readOnly} />
        </>)}
      </div>

      {/* Section 3: Health & Lifestyle */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Health & Lifestyle')}
        {field(<>
          <label style={label}>Does your dog have any medical conditions, allergies, or physical limitations I should know about?</label>
          <textarea style={{ ...inp, minHeight:80 }} value={form.medical_conditions} onChange={e => set('medical_conditions', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Does your dog have any food restrictions I should be aware of when using treats?</label>
          <input style={inp} value={form.food_restrictions} onChange={e => set('food_restrictions', e.target.value)} placeholder="e.g. chicken allergy, grain-free only" disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>What does a typical day look like for your dog?</label>
          <span style={sub}>Exercise, play, naps, etc.</span>
          <textarea style={{ ...inp, minHeight:80 }} value={form.typical_day} onChange={e => set('typical_day', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>How many hours per day is your dog usually left alone?</label>
          <input style={inp} value={form.hours_alone} onChange={e => set('hours_alone', e.target.value)} placeholder="e.g. 4-6 hours" disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Where does your dog spend most of their time at home?</label>
          <input style={inp} value={form.home_setup} onChange={e => set('home_setup', e.target.value)} placeholder="e.g. crate, free-roam, yard" disabled={readOnly} />
        </>)}
      </div>

      {/* Section 4: Background */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Background')}
        {field(<>
          <label style={label}>Where did your dog come from, and what do you know about their background?</label>
          <span style={sub}>Were they adopted from a shelter or rescue, purchased from a breeder, or rehomed from another family?</span>
          <textarea style={{ ...inp, minHeight:80 }} value={form.dog_background} onChange={e => set('dog_background', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>If adopted/rescue: what do you know about their history or past experiences?</label>
          <span style={sub}>Including any known traumatic events</span>
          <textarea style={{ ...inp, minHeight:80 }} value={form.rescue_history} onChange={e => set('rescue_history', e.target.value)} disabled={readOnly} />
        </>)}
      </div>

      {/* Section 5: Training History */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Training History')}
        {field(<>
          <label style={label}>Has your dog done any training before?</label>
          <span style={sub}>Classes, private sessions, or at-home practice</span>
          <textarea style={{ ...inp, minHeight:80 }} value={form.prior_training} onChange={e => set('prior_training', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Has your dog been socialized around other dogs, people, kids, or new environments?</label>
          <textarea style={{ ...inp, minHeight:80 }} value={form.socialization} onChange={e => set('socialization', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>What does your dog already know?</label>
          <div style={{ marginTop:8 }}>
            <CheckGroup name="skills" options={KNOWN_SKILLS} values={form.known_skills}
              onChange={v => toggleArray('known_skills', v)}
              otherKey="known_skills_other" otherValue={form.known_skills_other}
              onOtherChange={v => set('known_skills_other', v)} />
          </div>
        </>)}
        {field(<>
          <label style={label}>Do you use a clicker or marker word during training?</label>
          <RadioGroup name="marker_type" value={form.marker_type} onChange={v => set('marker_type', v)}
            options={['Clicker','Marker word (like "yes" or "good")','Neither','Not sure']} />
          {form.marker_type === 'Other' && <input style={{ ...inp, marginTop:8 }} value={form.marker_other} onChange={e => set('marker_other', e.target.value)} placeholder="Specify..." disabled={readOnly} />}
        </>)}
        {field(<>
          <label style={label}>Does your dog have a release command?</label>
          <RadioGroup name="release" value={form.has_release_command} onChange={v => set('has_release_command', v)} options={['Yes','No']} />
        </>)}
      </div>

      {/* Section 6: Behavior */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Behavior')}
        {field(<>
          <label style={label}>How does your dog usually respond to other dogs, people, or kids in public?</label>
          <textarea style={{ ...inp, minHeight:80 }} value={form.public_behavior} onChange={e => set('public_behavior', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Are there specific types of dogs/people/situations your dog struggles with or does especially well with?</label>
          <textarea style={{ ...inp, minHeight:80 }} value={form.struggles_and_strengths} onChange={e => set('struggles_and_strengths', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Are there any behavior concerns you'd like help with that haven't been mentioned already?</label>
          <span style={sub}>e.g. jumping, barking, pulling, fear, reactivity</span>
          <textarea style={{ ...inp, minHeight:80 }} value={form.other_concerns} onChange={e => set('other_concerns', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Has your dog ever bitten another dog or person?</label>
          <RadioGroup name="bitten" value={form.has_bitten} onChange={v => set('has_bitten', v)} options={['Yes (please explain below)','No']} />
          {form.has_bitten?.startsWith('Yes') && (
            <textarea style={{ ...inp, minHeight:80, marginTop:10 }} value={form.bite_details} onChange={e => set('bite_details', e.target.value)} placeholder="Please describe..." disabled={readOnly} />
          )}
        </>)}
        {field(<>
          <label style={label}>Is your dog comfortable being handled?</label>
          <span style={sub}>Brushed, paws touched, harness/collar put on</span>
          <RadioGroup name="handling" value={form.handling_comfort} onChange={v => set('handling_comfort', v)} options={['Yes','No','Other']} />
          {form.handling_comfort === 'Other' && <input style={{ ...inp, marginTop:8 }} value={form.handling_other} onChange={e => set('handling_other', e.target.value)} placeholder="Explain..." disabled={readOnly} />}
        </>)}
        {field(<>
          <label style={label}>Has your dog ever shown aggression when guarding food, toys, or resting spots?</label>
          <RadioGroup name="rg" value={form.resource_guarding} onChange={v => set('resource_guarding', v)} options={['Yes','No','Other']} />
          {form.resource_guarding === 'Other' && <input style={{ ...inp, marginTop:8 }} value={form.resource_guarding_other} onChange={e => set('resource_guarding_other', e.target.value)} placeholder="Explain..." disabled={readOnly} />}
        </>)}
      </div>

      {/* Section 7: Tools & Motivation */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Tools & Motivation')}
        {field(<>
          <label style={label}>What gear do you currently use?</label>
          <div style={{ marginTop:8 }}>
            <CheckGroup name="gear" options={GEAR_OPTIONS} values={form.gear_used}
              onChange={v => toggleArray('gear_used', v)}
              otherKey="gear_other" otherValue={form.gear_other}
              onOtherChange={v => set('gear_other', v)} />
          </div>
        </>)}
        {field(<>
          <label style={label}>What's your dog's highest value reward?</label>
          <span style={sub}>Treats, toys, games, praise — what gets your dog most excited?</span>
          <textarea style={{ ...inp, minHeight:60 }} value={form.highest_value_reward} onChange={e => set('highest_value_reward', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Does your dog have a favorite treat, toy, or activity?</label>
          <textarea style={{ ...inp, minHeight:60 }} value={form.favorite_treat_toy} onChange={e => set('favorite_treat_toy', e.target.value)} disabled={readOnly} />
        </>)}
      </div>

      {/* Section 8: Goals & Logistics */}
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-border)', borderRadius:'var(--radius-md)', padding:'20px 24px', marginBottom:16, boxShadow:'var(--card-shadow)' }}>
        {section('Training Goals & Logistics')}
        {field(<>
          <label style={label}>What are your main goals for training?</label>
          <textarea style={{ ...inp, minHeight:80 }} value={form.training_goals} onChange={e => set('training_goals', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Are there specific tricks or skills you'd love your dog to learn?</label>
          <textarea style={{ ...inp, minHeight:60 }} value={form.tricks_to_learn} onChange={e => set('tricks_to_learn', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>How confident do you feel about continuing training exercises between sessions?</label>
          <div style={{ display:'flex', gap:16, marginTop:8, alignItems:'center' }}>
            <span style={{ fontSize:12, color:'var(--gray-text)' }}>Not confident</span>
            {[1,2,3,4,5].map(n => (
              <label key={n} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor: readOnly ? 'default' : 'pointer' }}>
                <input type="radio" name="confidence" value={n} checked={form.owner_confidence===String(n)} onChange={() => !readOnly && set('owner_confidence', String(n))} style={{ accentColor:'var(--teal)' }} />
                <span style={{ fontSize:12, color:'var(--brown)' }}>{n}</span>
              </label>
            ))}
            <span style={{ fontSize:12, color:'var(--gray-text)' }}>Very confident</span>
          </div>
        </>)}
        {field(<>
          <label style={label}>Preferred training location</label>
          <div style={{ marginTop:8 }}>
            <CheckGroup name="locations" options={LOCATIONS} values={form.preferred_locations}
              onChange={v => toggleArray('preferred_locations', v)}
              otherKey="locations_other" otherValue={form.preferred_locations_other}
              onOtherChange={v => set('preferred_locations_other', v)} />
          </div>
        </>)}
        {field(<>
          <label style={label}>What city/town are you located in or would like training to take place?</label>
          <input style={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Boston, Somerville" disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Is there a specific timeline or upcoming event you'd like to prepare your dog for?</label>
          <textarea style={{ ...inp, minHeight:60 }} value={form.upcoming_event} onChange={e => set('upcoming_event', e.target.value)} disabled={readOnly} />
        </>)}
        {field(<>
          <label style={label}>Anything else you'd like me to know before we start?</label>
          <textarea style={{ ...inp, minHeight:80 }} value={form.anything_else} onChange={e => set('anything_else', e.target.value)} disabled={readOnly} />
        </>)}
      </div>

      {error && <div style={{ background:'#fef2f2', color:'#b91c1c', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:13, marginBottom:16 }}>{error}</div>}

      {!readOnly && (
        <div style={{ display:'flex', gap:12, marginTop:8, marginBottom:32 }}>
          {onCancel && <button onClick={onCancel} style={{ flex:1, padding:'12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--gray-border)', background:'var(--white)', fontSize:14, cursor:'pointer', color:'var(--brown)', fontFamily:'var(--font-sans)' }}>Cancel</button>}
          <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:'12px', borderRadius:'var(--radius-sm)', border:'none', background: saving ? '#7ab8a8' : 'var(--teal)', color:'white', fontSize:14, fontWeight:500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'var(--font-sans)' }}>
            {saving ? 'Saving...' : 'Save Intake Form'}
          </button>
        </div>
      )}
    </div>
  );
}
